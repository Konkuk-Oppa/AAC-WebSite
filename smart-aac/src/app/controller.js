export async function getRecommends({text}) {
    // 목업용 데이터
    const recommends = [
        "커피한잔주세요",
        "~한 상황",
    ]
    return {success: true, data: recommends};
}