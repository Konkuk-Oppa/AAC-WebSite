const BASE_URL = "http://127.0.0.1:5000";

export async function getRecommends({text}) {
  // 목업용 데이터
  const recommends = [
    "커피한잔주세요",
    "~한 상황",
  ]
  return {success: true, data: recommends};
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
export async function addText(text, type, cat0Name, cat1Name = "", cat2Name = "") {
  // 디버깅 용 코드
  return {success: true};

  try {
    const response = await fetch('/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        type: type,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
        cat2Name: cat2Name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding text:', error);
    return { success: false, error: error.message };
  }
}

export async function updateBookmark(text, cat0Name, cat1Name = "", cat2Name = "", bookmark) {
  // 디버깅 용 코드
  return {success: true};

  try {
    const response = await fetch('/update-bookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        bookmark: bookmark,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
        cat2Name: cat2Name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating bookmark:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteText(text, cat0Name, cat1Name = "", cat2Name = "") {
  // 디버깅용 코드
  return { success: true };
  try {
    const response = await fetch('/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
        cat2Name: cat2Name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting text:', error);
    return { success: false, error: error.message };
  }
}

export async function editText(oldText, newText, cat0Name, cat1Name = "", cat2Name = "") {
  // 디버깅용 코드
  return { success: true };
  try {
    const response = await fetch('/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldText: oldText,
        newText: newText,
        cat0Name: cat0Name,
        cat1Name: cat1Name,
        cat2Name: cat2Name
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error editing text:', error);
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