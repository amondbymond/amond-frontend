import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Container,
  Breadcrumbs,
  Link,
  keyframes,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/router';
import { apiCall } from '@/module/utils/api';
import LoginContext from '@/module/ContextAPI/LoginContext';
import { BodyContainer } from '@/component/ui/BodyContainer';
import UsageLimitWarning from '@/component/ui/UsageLimitWarning';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) translateX(100px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) translateX(var(--final-x)) translateY(var(--final-y)) scale(var(--final-scale));
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const rotateIn = keyframes`
  from {
    transform: translate(-50%, -50%) translateX(500px) scale(0.7);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) translateX(var(--final-x)) translateY(var(--final-y)) scale(var(--final-scale));
    opacity: var(--final-opacity);
  }
`;

// Content type mappings by category
const CONTENT_TYPES: Record<string, string[]> = {
  '뷰티/미용': [
    '효능 강조', '사용 후기', '신제품 소개', '이벤트', '성분 스토리',
    '사용법 공유', '브랜드 무드', '뷰티 꿀팁', '챌린지', '인플루언서'
  ],
  '미식/푸드': [
    '메뉴 소개', '후기 리그램', '시즌 메뉴', '할인 이벤트', '공간 무드',
    '레시피 공유', '운영 안내', '고객 인증샷', '음식 철학', '비하인드'
  ],
  '일상/트렌드': [
    '일상 공유', '감성 무드', '트렌드 밈', '팔로워 소통', 'Q&A',
    '챌린지', '루틴 공개', '투표 유도', '공감 한줄', '소소한 팁'
  ],
  '패션': [
    '착장 소개', '신상 오픈', '스타일링팁', '할인 공지', '후기 공유',
    '룩북 공개', '브랜드 무드', '소재 강조', '착용샷', '촬영 비하인드'
  ],
  '자기개발': [
    '인사이트', '동기부여', '후기 인증', '강의 소개', '꿀팁 요약',
    '브랜딩 강조', '체크리스트', '컨설팅 홍보', '일상 회고', '성장 스토리'
  ],
  '지식 콘텐츠': [
    '트렌드 요약', '뉴스 큐레이션', '카드뉴스', '인포그래픽', '데이터 요약',
    '개념 정리', '퀴즈', '세미나 홍보', '용어 해설', '브리핑'
  ],
  '건강/헬스': [
    '운동 루틴', '후기 사례', '클래스 안내', '식단 공유', '헬스 꿀팁',
    '자기관리', '감성 인용', '무료 체험', '공간 소개', '전문가 소개'
  ],
};

interface FeedConcept {
  id: number;
  title: string;
  snsEvent: boolean;
  contentType: string;
  imageDescription: string;
  coreMessage: string;
  hashtags: string;
  caption: string;
  imageSize: '1:1' | '4:5' | '3:4' | '16:9';
}

export default function SingleImageGenerationPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const { userInfo } = useContext(LoginContext);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedConcepts, setFeedConcepts] = useState<FeedConcept[]>([]);
  const [projectData, setProjectData] = useState<any>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showUsageWarning, setShowUsageWarning] = useState(false);
  const [usageLimits, setUsageLimits] = useState<any>(null);
  const [proceedWithGeneration, setProceedWithGeneration] = useState(false);
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    console.log('UserInfo:', userInfo);
    if (projectId && userInfo?.id) {
      loadProjectData();
    } else if (projectId && !userInfo?.id) {
      // Wait a bit for auth to load
      setTimeout(() => {
        if (!userInfo?.id) {
          alert('로그인이 필요합니다.');
          router.push('/login');
        }
      }, 1000);
    }
  }, [projectId, userInfo]);

  const loadProjectData = async () => {
    try {
      const response = await apiCall({
        url: "/content/project/detail",
        method: "get",
        params: { projectId },
      });
      
      if (response.data) {
        console.log('Project data loaded:', response.data);
        const project = response.data.projectData || response.data;
        setProjectData(project);
        await generateFeedConcepts(project);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      alert('프로젝트 정보를 불러오는데 실패했습니다.');
      router.back();
    }
  };

  const generateFeedConcepts = async (project: any) => {
    setLoading(true);
    try {
      console.log('Project object:', project);
      console.log('Project category:', project.category);
      
      const categoryContentTypes = CONTENT_TYPES[project.category] || CONTENT_TYPES['일상/트렌드'];
      
      const sessionToken = localStorage.getItem("amondSessionToken");
      console.log('Session token:', sessionToken ? 'Present' : 'Missing');
      const requestData = {
        feedSetData: {
          brandName: project.name || project.brandName || 'Unknown Brand',
          essentialKeyword: project.essentialKeyword || '',
          trendIssue: project.trendIssue || '',
          toneMannerList: project.toneMannerList || '모던하고 세련된',
          directionList: project.directionList || '정보형',
        },
        brandCategory: project.category || '일상/트렌드',
        contentTypes: categoryContentTypes,
      };
      
      console.log('Sending request with data:', requestData);
      
      const response = await apiCall({
        url: '/api/ai/generateSingleImageConcepts',
        method: 'post',
        body: requestData,
      });

      if (response.data?.concepts) {
        setFeedConcepts(response.data.concepts);
      }
    } catch (error: any) {
      console.error('Failed to generate concepts:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || '피드 컨셉 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (feedConcepts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % feedConcepts.length);
  };

  const handlePrev = () => {
    if (feedConcepts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + feedConcepts.length) % feedConcepts.length);
  };

  const handleFieldChange = (index: number, field: keyof FeedConcept, value: any) => {
    const updatedConcepts = [...feedConcepts];
    updatedConcepts[index] = {
      ...updatedConcepts[index],
      [field]: value,
    };
    setFeedConcepts(updatedConcepts);
  };


  const handleGenerateImage = async () => {
    // Check usage limits first
    if (!proceedWithGeneration) {
      try {
        const usageResponse = await apiCall({
          url: "/content/usage-limits",
          method: "GET",
        });
        const limits = usageResponse.data.limits;
        setUsageLimits(limits);
        
        // Show warning dialog
        if (!limits.singleImages.canCreate || limits.singleImages.remaining <= 1) {
          setShowUsageWarning(true);
          return;
        }
      } catch (error) {
        console.error("Failed to check usage limits:", error);
      }
    }
    
    const currentConcept = feedConcepts[currentIndex];
    setGeneratingImage(true);
    
    try {
      const response = await apiCall({
        url: '/api/ai/generateSingleImage',
        method: 'post',
        body: {
          concept: currentConcept,
          brandId: projectData.id,
        },
      });

      if (response.data?.success) {
        alert('이미지가 성공적으로 생성되었습니다!');
        router.push(`/project/${projectId}`);
      }
    } catch (error) {
      console.error('Failed to generate single image:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const categoryContentTypes = CONTENT_TYPES[projectData?.category] || CONTENT_TYPES['일상/트렌드'];

  // Keep non-center cards scrolled to top
  useEffect(() => {
    Object.keys(cardRefs.current).forEach((key) => {
      const index = parseInt(key);
      if (index !== currentIndex && cardRefs.current[index]) {
        const element = cardRefs.current[index];
        if (element) {
          element.scrollTop = 0;
        }
      }
    });
  }, [currentIndex]);

  // Get all cards for circular carousel - all cards visible with different positions
  const getAllCardsWithPositions = () => {
    if (feedConcepts.length === 0) return [];
    
    const totalCards = feedConcepts.length;
    const positions = [];
    
    for (let i = 0; i < totalCards; i++) {
      // Calculate position relative to current index
      const relativePos = i - currentIndex;
      
      // Normalize position to be within -halfTotal to halfTotal
      let normalizedPos = relativePos;
      const halfTotal = Math.floor(totalCards / 2);
      
      if (normalizedPos > halfTotal) {
        normalizedPos = normalizedPos - totalCards;
      } else if (normalizedPos < -halfTotal) {
        normalizedPos = normalizedPos + totalCards;
      }
      
      positions.push({
        index: i,
        position: normalizedPos
      });
    }
    
    return positions;
  };

  return (
    <BodyContainer>
      {/* Temporary disabled overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          개별 이미지 생성 기능 준비 중
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          더 나은 서비스를 위해 업데이트 중입니다.
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push(`/project/${projectId}`)}
          sx={{ backgroundColor: '#FFA726', '&:hover': { backgroundColor: '#FF9800' } }}
        >
          프로젝트로 돌아가기
        </Button>
      </Box>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              color="inherit"
              onClick={() => router.push('/')}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              홈
            </Link>
            <Link
              underline="hover"
              color="inherit"
              sx={{ cursor: 'pointer' }}
              onClick={() => router.push(`/project/${projectId}`)}
            >
              {projectData?.name || '프로젝트'}
            </Link>
            <Typography color="text.primary">개별 이미지 생성</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.back()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              개별 이미지 생성
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : feedConcepts.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Card Section */}
            <Box>
              {/* Centered carousel */}
              <Box sx={{ position: 'relative', height: 600, width: '100%', overflow: 'visible', px: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  position: 'relative',
                  width: '100%',
                }}>
                  {/* Left navigation button */}
                  <IconButton 
                    onClick={handlePrev} 
                    sx={{ 
                      position: 'absolute', 
                      left: 20, 
                      zIndex: 30,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <ArrowBackIosIcon />
                  </IconButton>

                  {/* Cards viewport - vertical stacking */}
                  <Box sx={{ 
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getAllCardsWithPositions().map(({ index: actualIndex, position }) => {
                      const concept = feedConcepts[actualIndex];
                      const isCenter = position === 0;
                      
                      // Calculate position in a circular arrangement
                      const angle = (position / feedConcepts.length) * Math.PI * 2;
                      const radius = 350; // Distance from center
                      
                      // Calculate stacking position for circular carousel
                      let stackOffset = 0;
                      let scale = 1;
                      let opacity = 1;
                      let zIndex = 10;
                      let verticalOffset = 0;
                      
                      if (isCenter) {
                        // Center card - prominent and bigger
                        stackOffset = 0;
                        scale = 1.1; // Make it 10% bigger
                        opacity = 1;
                        zIndex = 30;
                        verticalOffset = 0;
                      } else {
                        // Calculate position based on circular arrangement
                        // Cards closer to center are bigger and more visible
                        const distance = Math.abs(position);
                        const maxDistance = Math.floor(feedConcepts.length / 2);
                        const normalizedDistance = distance / maxDistance;
                        
                        // Horizontal offset based on position
                        stackOffset = position * 180; // Spread cards horizontally
                        
                        // Scale decreases with distance from center
                        scale = 0.9 - (normalizedDistance * 0.3);
                        
                        // Opacity decreases with distance
                        opacity = 0.9 - (normalizedDistance * 0.4);
                        
                        // Z-index based on distance (closer cards on top)
                        zIndex = 20 - distance;
                        
                        // Vertical offset creates depth
                        verticalOffset = distance * 25;
                      }
                      
                      // Simple transform string
                      const transformString = `translate(-50%, -50%) translateX(${stackOffset}px) translateY(${verticalOffset}px) scale(${scale})`;
                      
                      return (
                        <Card
                          key={`card-${actualIndex}`}
                          sx={{
                            width: 420,
                            height: 540,
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: transformString,
                            background: 'white',
                            boxShadow: isCenter 
                              ? '0 20px 40px rgba(0,0,0,0.2)' 
                              : '0 10px 20px rgba(0,0,0,0.1)',
                            cursor: isCenter ? 'default' : 'pointer',
                            border: isCenter ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            zIndex: zIndex,
                            opacity: opacity,
                            overflow: 'hidden',
                            transition: 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)',
                            '&:hover': !isCenter ? {
                              transform: `translate(-50%, -50%) translateX(${stackOffset}px) translateY(${verticalOffset - 10}px) scale(${scale * 1.02})`,
                              boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                            } : {},
                          }}
                          onClick={(e) => {
                            if (!isCenter) {
                              e.stopPropagation();
                              setCurrentIndex(actualIndex);
                            }
                          }}
                        >
                          <CardContent sx={{ p: 0, height: '100%', '&:last-child': { pb: 0 } }}>
                            <Box
                              ref={(el: HTMLDivElement | null) => { cardRefs.current[actualIndex] = el; }}
                              sx={{ 
                                p: 2, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                overflow: isCenter ? 'auto' : 'hidden',
                                fontSize: '0.875rem',
                                '&::-webkit-scrollbar': {
                                  width: '4px',
                                },
                                '&::-webkit-scrollbar-track': {
                                  background: '#f1f1f1',
                                  borderRadius: '2px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                  background: '#888',
                                  borderRadius: '2px',
                                  '&:hover': {
                                    background: '#555',
                                  },
                                },
                              }}>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                                피드 #{actualIndex + 1}
                              </Typography>
                            </Box>
                            
                            {/* Fields */}
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                              {/* Title */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">제목</Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={concept.title}
                                  onChange={(e) => handleFieldChange(actualIndex, 'title', e.target.value)}
                                  InputProps={{ 
                                    style: { fontSize: '0.9rem' },
                                    readOnly: !isCenter
                                  }}
                                  disabled={!isCenter}
                                  sx={{
                                    '& .Mui-disabled': {
                                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                      color: 'rgba(0, 0, 0, 0.87)',
                                    }
                                  }}
                                />
                              </Box>
                              
                              {/* SNS Event & Content Type */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">SNS 이벤트 / 콘텐츠 타입</Typography>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                  <FormControlLabel
                                    control={
                                      <Switch
                                        size="small"
                                        checked={concept.snsEvent}
                                        onChange={(e) => isCenter && handleFieldChange(actualIndex, 'snsEvent', e.target.checked)}
                                        disabled={!isCenter}
                                      />
                                    }
                                    label="이벤트"
                                    sx={{ mr: 2 }}
                                  />
                                  
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
                                    {categoryContentTypes.map((type) => (
                                      <Chip
                                        key={type}
                                        label={type}
                                        size="small"
                                        onClick={() => isCenter && handleFieldChange(actualIndex, 'contentType', type)}
                                        color={concept.contentType === type ? 'primary' : 'default'}
                                        variant={concept.contentType === type ? 'filled' : 'outlined'}
                                        sx={{ 
                                          fontSize: '0.75rem',
                                          cursor: isCenter ? 'pointer' : 'default',
                                          opacity: !isCenter && concept.contentType !== type ? 0.6 : 1,
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                              
                              {/* Image Description */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">이미지 묘사</Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  multiline
                                  minRows={1}
                                  maxRows={2}
                                  value={concept.imageDescription}
                                  onChange={(e) => handleFieldChange(actualIndex, 'imageDescription', e.target.value)}
                                  InputProps={{ 
                                    style: { fontSize: '0.85rem' },
                                    readOnly: !isCenter
                                  }}
                                  disabled={!isCenter}
                                  sx={{
                                    '& .Mui-disabled': {
                                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                      color: 'rgba(0, 0, 0, 0.87)',
                                    }
                                  }}
                                />
                              </Box>
                              
                              {/* Core Message */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">핵심 메시지</Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={concept.coreMessage}
                                  onChange={(e) => handleFieldChange(actualIndex, 'coreMessage', e.target.value)}
                                  InputProps={{ 
                                    style: { fontSize: '0.85rem' },
                                    readOnly: !isCenter
                                  }}
                                  disabled={!isCenter}
                                  sx={{
                                    '& .Mui-disabled': {
                                      WebkitTextFillColor: '#1976d2',
                                      color: '#1976d2',
                                      '& input': {
                                        fontWeight: 600
                                      }
                                    }
                                  }}
                                />
                              </Box>
                              
                              {/* Hashtags */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">해시태그</Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={concept.hashtags}
                                  onChange={(e) => handleFieldChange(actualIndex, 'hashtags', e.target.value)}
                                  InputProps={{ 
                                    style: { fontSize: '0.85rem' },
                                    readOnly: !isCenter
                                  }}
                                  disabled={!isCenter}
                                  sx={{
                                    '& .Mui-disabled': {
                                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.6)',
                                      color: 'rgba(0, 0, 0, 0.6)',
                                    }
                                  }}
                                />
                              </Box>
                              
                              {/* Caption */}
                              <Box>
                                <Typography variant="caption" color="text.secondary">캡션</Typography>
                                <TextField
                                  fullWidth
                                  size="small"
                                  multiline
                                  minRows={1}
                                  maxRows={3}
                                  value={concept.caption}
                                  onChange={(e) => handleFieldChange(actualIndex, 'caption', e.target.value)}
                                  InputProps={{ 
                                    style: { fontSize: '0.85rem' },
                                    readOnly: !isCenter
                                  }}
                                  disabled={!isCenter}
                                  sx={{
                                    '& .Mui-disabled': {
                                      WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                                      color: 'rgba(0, 0, 0, 0.87)',
                                    }
                                  }}
                                />
                              </Box>
                              
                              {/* Image Size */}
                              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="caption" color="text.secondary">이미지 사이즈</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                  {['1:1', '4:5', '3:4', '16:9'].map((size) => (
                                    <Chip
                                      key={size}
                                      label={size}
                                      size="small"
                                      onClick={() => isCenter && handleFieldChange(actualIndex, 'imageSize', size)}
                                      color={concept.imageSize === size ? 'primary' : 'default'}
                                      variant={concept.imageSize === size ? 'filled' : 'outlined'}
                                      sx={{
                                        cursor: isCenter ? 'pointer' : 'default',
                                        opacity: !isCenter && concept.imageSize !== size ? 0.6 : 1,
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>

                  {/* Right navigation button */}
                  <IconButton 
                    onClick={handleNext} 
                    sx={{ 
                      position: 'absolute', 
                      right: 20, 
                      zIndex: 30,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>

                {/* Card indicators */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                  {feedConcepts.map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: index === currentIndex ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Action Section */}
            <Box sx={{ width: '100%' }}>
              <Card sx={{ p: 3, mx: 'auto', maxWidth: 600 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    이미지 생성
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    선택한 컨셉으로 AI가 이미지를 생성합니다. 생성된 이미지는 프로젝트에 자동으로 추가됩니다.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                    ⚡ GPT-4o를 사용하여 더 빠르고 창의적인 컨셉을 생성합니다.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateImage}
                    disabled={loading || feedConcepts.length === 0 || generatingImage}
                    sx={{ minWidth: 200 }}
                  >
                    {generatingImage ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      '이미지 생성하기'
                    )}
                  </Button>
                </Box>
              </Card>
            </Box>
          </Box>
        ) : (
          <Typography>피드 컨셉을 생성할 수 없습니다.</Typography>
        )}
      </Container>
      
      {showUsageWarning && usageLimits && (
        <UsageLimitWarning
          open={showUsageWarning}
          onClose={() => {
            setShowUsageWarning(false);
            setProceedWithGeneration(false);
          }}
          onConfirm={() => {
            setShowUsageWarning(false);
            setProceedWithGeneration(true);
            // Retry generation after user confirms
            handleGenerateImage();
          }}
          type="single_image"
          remaining={usageLimits.singleImages.remaining}
          canPerform={usageLimits.singleImages.canCreate}
          userGrade={userInfo?.grade}
        />
      )}
    </BodyContainer>
  );
}