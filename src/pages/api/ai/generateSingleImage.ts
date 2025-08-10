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

    const { concept, brandId } = req.body;

    if (!concept || !brandId) {
      return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
    }

    // Forward request to backend with authentication
    const backendResponse = await axios.post(
      `${BACKEND_API_URL}/content/single-image`,
      {
        concept,
        brandId,
      },
      {
        headers: {
          'Cookie': `connect.sid=${sessionToken}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    return res.status(200).json(backendResponse.data);

  } catch (error: any) {
    console.error('Generate single image error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ message: '인증이 만료되었습니다.' });
    }
    
    return res.status(error.response?.status || 500).json({ 
      message: error.response?.data?.message || '이미지 생성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}