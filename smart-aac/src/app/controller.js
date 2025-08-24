'use server'

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const BASE_URL = "http://127.0.0.1:5000";

// Google Cloud TTS 클라이언트 초기화
let ttsClient;

function initializeTTSClient() {
  if (!ttsClient) {
    const config = {};
    
    // 환경변수에서 인증 정보 확인
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    } else if (process.env.GOOGLE_CLOUD_PROJECT && 
               process.env.GOOGLE_CLOUD_PRIVATE_KEY && 
               process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
      config.credentials = {
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      };
      config.projectId = process.env.GOOGLE_CLOUD_PROJECT;
    }
    
    ttsClient = new TextToSpeechClient(config);
  }
  return ttsClient;
}


/* BULK */
export async function addBulk() {
  try{
    let response = await fetch(`${BASE_URL}/bulk/file`, {
      method: 'POST',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`HTTP error! status: ${response.status} ${result.error}`);
    }

    const data = await response.json();
    return {success: true, data: data};
  } catch (error) {
    console.error('Error adding bulk data:', error);
    return {success: false, error: error.message};
  }
}

/* RECOMMEND */
export async function getRecommends({text, topk=5}) {
  let body;
  if (topk === 5) body = JSON.stringify({ text });
  else body = JSON.stringify({ text, num_predictions: topk });
  try{
    const response = await fetch(`${BASE_URL}/api/word/api_recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(`HTTP error! status: ${response.status} ${result.error}`);
    }

    const data = await response.json();
    return {success: true, data: data.predictions};
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return {success: false, error: error.message};
  }
}

export async function getRecommendCategory({text}) {
  try{
    const response = await fetch(`${BASE_URL}/api/category/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {success: true, data: data.recommendations};
  } catch (error) {
    console.error('Error fetching recommended categories:', error);
    return {success: false, error: error.message};
  }
}

/* TTS */
export async function getTTS({text, ttsType}) {
  try {
    // TTS 클라이언트 초기화
    const client = initializeTTSClient();
    
    // Google Cloud TTS 요청 구성
    const request = {
      input: { text: text },
      voice: {
        languageCode: 'ko-KR', // 한국어
        name: ttsType, // 고품질 신경망 음성
        // ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3', // MP3 형식으로 출력
        speakingRate: 1.0, // 말하기 속도
        pitch: 0.0, // 음높이
        volumeGainDb: 0.0, // 볼륨
      },
    };

    // TTS 요청 실행
    const [response] = await client.synthesizeSpeech(request);
    
    // 오디오 데이터를 Blob으로 변환
    const audioBlob = new Blob([response.audioContent], { type: 'audio/mp3' });
    
    return { success: true, data: audioBlob };
  } catch (error) {
    console.error('Google Cloud TTS 오류:', error);
    return { success: false, error: error.message };
  }
}

/* USER */
export async function makeUser(formData) {
  try{
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: formData.email})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.error}`);
    }

    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
}

export async function getUser({email}) {
  try {
    const response = await fetch(`${BASE_URL}/users?email=${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data.user };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return { success: false, error: error.message };
  }
}

/* TEXT */
export async function addCategory({catNames}) {
  try{
    const response = await fetch(`${BASE_URL}/bulk/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories: catNames })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const createdID = {};
    if (!result.success) {
      return { success: false, error: result.error };
    }

    for (let cat of result.data.created_categories) {
      createdID[cat.value] = cat.id;
    }
    for (let cat of result.data.skipped_categories) {
      createdID[cat.value] = cat.id; 
    }

    return { success: true, data: createdID };
  } catch (error) {
    console.error('Error adding text:', error);
    return { success: false, error: error.message };
  }
}

export async function addText(text, type, cat0ID, cat1ID = null, cat2ID = null) {
  try {
    let response, result;

    if (type === 'sentence') {
      response = await fetch(`${BASE_URL}/sentences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: text,
          category0_id: cat0ID,
          category1_id: cat1ID,
          category2_id: cat2ID
        })
      });
    } else {
      response = await fetch(`${BASE_URL}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: text,
          category0_id: cat0ID,
          category1_id: cat1ID,
          category2_id: cat2ID
        })
      });
    }

    if (response.status === 400) {
      return {success: false, error: "이미 존재"}
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.sentence || result.word };
  } catch (error) {
    console.error('Error adding text:', error);
    return { success: false, error: error.message };
  }
}

export async function updateBookmark(userID, textID) {
  try {
    const response = await fetch(`${BASE_URL}/users/${userID}/bookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word_id: textID
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.bookmark.bookmark };
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteText(textID) {
  try {
    let response;

    response = await fetch(`${BASE_URL}/sentences/${textID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.status === 404) {
      response = await fetch(`${BASE_URL}/words/${textID}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 404) {
        return { success: false, error: "해당 텍스트가 존재하지 않습니다." };
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting text:', error);
    return { success: false, error: error.message };
  }
}

export async function editText(textID, newText, cat0ID, cat1ID = null, cat2ID = null) {
  try {
    let response;
    const body = JSON.stringify({
      value: newText,
      category0_id: cat0ID,
      category1_id: cat1ID,
      category2_id: cat2ID
    });

    response = await fetch(`${BASE_URL}/sentences/${textID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    });
    
    if (response.status === 404) {
      response = await fetch(`${BASE_URL}/words/${textID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body
      });

      if (response.status === 404) {
        return { success: false, error: "해당 텍스트가 존재하지 않습니다." };
      }
    }

    if (response.status === 400) {
      return { success: false, error: "중복" };
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting text:', error);
    return { success: false, error: error.message };
  }
}

export async function updateText(userID, textID) {
  try{
    const response = await fetch(`${BASE_URL}/common-word/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userID,
        common_word_ids: [textID]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating text:', error);
    return { success: false, error: error.message };  
  }
}

/* CATEGORY */
export async function getCategories(userID) {
  try {
    const response = await fetch(`${BASE_URL}/categories/getList?userId=${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(catID) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${catID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

export async function editCategory(catID, newCatName) {
  try {
    const response = await fetch(`${BASE_URL}/categories/${catID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: newCatName
      })
    });

    if (response.status === 400) {
      return { success: false, error: "중복" };
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error editing category:', error);
    return { success: false, error: error.message };
  }
}

/* CONVERSATION */
export async function getConversations() {
  try {
    const response = await fetch(`${BASE_URL}/conversation`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error };
    }

    return { success: true, data: data.conversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, error: error.message };
  }
}

export async function addConversation(userID, text) {
  try {
    const response = await fetch(`${BASE_URL}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: userID, value: text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      return { success: false, error: data.error };
    }
    return { success: true };
  } catch (error) {
    console.error('Error adding conversation:', error);
    return { success: false, error: error.message };
  }
}