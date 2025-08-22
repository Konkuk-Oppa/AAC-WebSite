const BASE_URL = "http://127.0.0.1:5000";

export async function getRecommends({text}) {
  // 목업용 데이터
  const recommends = [
    "커피한잔주세요",
    "~한 상황",
  ]
  return {success: true, data: recommends};
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

// 입력한 단어 및 문장에 따라 카테고리 추천
export async function getRecommendCategory({text}) {
  // 목업용 데이터
  const recommendCategory = [
    {
      category0:"인사",
      category1:"안녕",
      category2:"안녕하세요"
    }, {
      category0:"음식",
      category1:"한식",
      category2:""
    }];
    return {success: true, data: recommendCategory};
}

export async function getTTS({text}) {
  return { success:true, data: "음성 합성된 텍스트" }
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

/* CATEGORY */
export async function editCategory(oldCatName, newCatName, cat0Name = "", cat1Name = "") {
  // 디버깅용 코드
  return { success: true };
  try {
    const response = await fetch('/edit-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldCat: oldCatName,
        newCat: newCatName,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error editing category:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(cat, cat0Name = "", cat1Name = "") {
  // 디버깅용 코드
  return { success: true };
  try {
    const response = await fetch('/delete-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cat: cat,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message };
  }
}

/* CONVERSATION */
export async function addConversation(text) {
  return { success: true };

}