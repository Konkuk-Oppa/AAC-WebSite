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
      category0:"카테고리0",
      category1:"카테고리1",
      category2:"카테고리2"
    }, {
      category0:"카테고리0",
      category1:"카테고리1",
      category2:""
    }];
    return {success: true, data: recommendCategory};
}

export async function addText({text, type, cat0Name, cat1Name = "", cat2Name = ""}) {
  // 목업용 데이터
  return {success: true};
}