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

export async function addText({text, type, cat0Name, cat1Name = "", cat2Name = ""}) {
  // 목업용 데이터
  return {success: true};
}