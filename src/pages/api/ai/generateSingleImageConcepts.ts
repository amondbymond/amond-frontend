import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:4000';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session token from cookies or headers
    const sessionToken = req.cookies.amondSessionToken || 
                        req.headers.authorization?.replace('Bearer ', '') ||
                        req.body.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { feedSetData, brandCategory, contentTypes } = req.body;

    if (!feedSetData || !brandCategory || !contentTypes) {
      return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
    }

    // GPT-4o prompt for generating feed concepts
    const prompt = `
당신은 인스타그램 콘텐츠 기획 전문가입니다. 브랜드 정보를 바탕으로 5개의 매력적인 피드 컨셉을 생성해주세요.

브랜드 정보:
- 브랜드명: ${feedSetData.brandName}
- 카테고리: ${brandCategory}
- 필수 키워드: ${feedSetData.essentialKeyword || '없음'}
- 트렌드 이슈: ${feedSetData.trendIssue || '없음'}
- 톤앤매너: ${Array.isArray(feedSetData.toneMannerList) ? feedSetData.toneMannerList.join(', ') : feedSetData.toneMannerList}
- 방향성: ${Array.isArray(feedSetData.directionList) ? feedSetData.directionList.join(', ') : feedSetData.directionList}

사용 가능한 콘텐츠 타입: ${contentTypes.join(', ')}

각 피드 컨셉은 다음 형식으로 작성해주세요:

1. 제목: 피드의 핵심 주제 (20자 이내)
2. SNS 이벤트 여부: true/false
3. 콘텐츠 타입: 위에서 제공한 타입 중 하나 선택
4. 이미지 묘사: 구체적인 비주얼 설명 (50자 이내)
5. 핵심 메시지: 전달하고자 하는 핵심 내용 (30자 이내)
6. 해시태그: #브랜드명 포함 5-7개
7. 캡션: 매력적인 인스타그램 캡션 (100자 이내)
8. 이미지 사이즈: 1:1, 4:5, 3:4, 16:9 중 하나

다양하고 창의적인 5개의 피드 컨셉을 JSON 배열 형식으로 반환해주세요.
`;

    // Call OpenAI API using GPT-4o for faster response
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an Instagram content planning expert. Always respond in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedContent = openaiResponse.data.choices[0].message.content;
    let concepts;

    try {
      const parsed = JSON.parse(generatedContent);
      // Handle different possible JSON structures
      concepts = parsed.concepts || parsed.feedConcepts || parsed.feeds || parsed;
      
      // Ensure it's an array
      if (!Array.isArray(concepts)) {
        concepts = [concepts];
      }

      // Format concepts to match expected structure
      concepts = concepts.slice(0, 5).map((concept: any, index: number) => ({
        id: index + 1,
        title: concept.title || concept.제목 || `피드 ${index + 1}`,
        snsEvent: concept.snsEvent !== undefined ? concept.snsEvent : (concept['SNS 이벤트 여부'] === 'true' || concept['SNS 이벤트 여부'] === true),
        contentType: concept.contentType || concept['콘텐츠 타입'] || contentTypes[0],
        imageDescription: concept.imageDescription || concept['이미지 묘사'] || '',
        coreMessage: concept.coreMessage || concept['핵심 메시지'] || '',
        hashtags: concept.hashtags || concept['해시태그'] || '',
        caption: concept.caption || concept['캡션'] || '',
        imageSize: concept.imageSize || concept['이미지 사이즈'] || '1:1'
      }));
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      return res.status(500).json({ message: 'AI 응답 파싱 실패' });
    }

    return res.status(200).json({ 
      success: true, 
      concepts 
    });

  } catch (error: any) {
    console.error('Generate concepts error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ message: '인증이 만료되었습니다.' });
    }
    
    return res.status(500).json({ 
      message: error.response?.data?.message || '피드 컨셉 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}