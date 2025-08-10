import { useState, useEffect } from "react";
import { Box, Typography, Paper, Divider, Chip, Alert, TextField, IconButton, InputAdornment } from "@mui/material";
import { useRouter } from "next/router";
import { apiCall } from "@/module/utils/api";
import UnifiedButton from "@/component/ui/UnifiedButton";
import dayjs from "dayjs";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface UserInfo {
  id: number;
  email: string;
  name: string;
  grade: string;
  authType: string;
  membershipStartDate: string;
  membershipEndDate: string;
  membershipStatus: string;
  createdAt: string;
  lastLoginAt: string;
}

interface BillingInfo {
  id: number;
  cardNumber: string;
  cardName: string;
  createdAt: string;
}

interface SubscriptionInfo {
  id: number;
  planType: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  price: number;
}

interface UsageLimits {
  projects: {
    remaining: number;
    canCreate: boolean;
  };
  singleImages: {
    remaining: number;
    canCreate: boolean;
  };
  edits: {
    remainingToday: number | null;
    canEdit: boolean;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // 사용자 정보 가져오기
      const userResponse = await apiCall({
        url: "/auth/user",
        method: "GET",
      });
      setUserInfo(userResponse.data);

      // 빌링키 정보 가져오기
      const billingResponse = await apiCall({
        url: "/payment/inicis/billing-keys",
        method: "GET",
      });
      
      if (billingResponse.data.data && billingResponse.data.data.length > 0) {
        const activeBilling = billingResponse.data.data.find((b: any) => b.status === 'active');
        setBillingInfo(activeBilling || billingResponse.data.data[0]);
      }

      // 구독 정보는 백엔드에서 아직 구현되지 않았으므로 임시로 설정
      if (userResponse.data.grade === 'pro') {
        setSubscriptionInfo({
          id: 1,
          planType: 'pro',
          status: 'active',
          startDate: userResponse.data.membershipStartDate,
          nextBillingDate: userResponse.data.membershipEndDate,
          price: 9900
        });
      }

      // 사용 한도 정보 가져오기
      try {
        const usageResponse = await apiCall({
          url: "/content/usage-limits",
          method: "GET",
        });
        setUsageLimits(usageResponse.data.limits);
      } catch (error) {
        console.error("Failed to fetch usage limits:", error);
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (confirm("정말로 구독을 취소하시겠습니까? 현재 결제 기간까지는 서비스를 이용하실 수 있습니다.")) {
      try {
        const response = await apiCall({
          url: "/payment/inicis/cancel-subscription",
          method: "POST",
        });
        
        if (response.data.success) {
          alert(response.data.message);
          // 페이지 새로고침하여 상태 업데이트
          window.location.reload();
        } else {
          alert(response.data.message || "구독 취소에 실패했습니다.");
        }
      } catch (error: any) {
        console.error("구독 취소 에러:", error);
        alert(error?.response?.data?.message || "구독 취소 중 오류가 발생했습니다.");
      }
    }
  };

  const handleUpdatePaymentMethod = () => {
    router.push("/subscribe");
  };

  const handlePasswordChange = async () => {
    // 비밀번호 유효성 검사
    if (!newPassword || !confirmPassword) {
      setPasswordError("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      const response = await apiCall({
        url: "/auth/changePassword",
        method: "PUT",
        body: { password: newPassword }
      });

      if (response.status === 200) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        setShowPasswordChange(false);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
      }
    } catch (error: any) {
      console.error("비밀번호 변경 에러:", error);
      setPasswordError(error?.response?.data?.message || "비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#FFF3E0' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: "#FFF3E0", minHeight: "100vh", pb: 6 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", pt: 8, px: 3 }}>
        <Typography fontSize={32} fontWeight={700} mb={4}>
          프로필
        </Typography>

        {/* 계정 정보 */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Typography fontSize={20} fontWeight={700} mb={3}>
            계정 정보
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography color="grey.600" mb={1}>이름</Typography>
              <Typography fontSize={18} fontWeight={600}>
                {userInfo.name || '이름 없음'}
              </Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>로그인 방식</Typography>
              <Typography fontSize={18} fontWeight={600}>
                {userInfo.authType === '이메일' ? '이메일' : 
                 userInfo.authType === '카카오' ? '카카오 계정' :
                 userInfo.authType === '구글' ? '구글 계정' : userInfo.authType}
              </Typography>
            </Box>
            {userInfo.email && (
              <Box>
                <Typography color="grey.600" mb={1}>이메일</Typography>
                <Typography fontSize={18} fontWeight={600}>
                  {userInfo.email}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography color="grey.600" mb={1}>회원 등급</Typography>
              <Typography fontSize={18} fontWeight={600}>
                {userInfo.grade === 'basic' || userInfo.grade === 'c' || userInfo.grade === 'C' ? '베이직 (무료)' :
                 userInfo.grade === 'pro' ? '프로' :
                 userInfo.grade === 'business' ? '비즈니스' :
                 userInfo.grade === 'premium' ? '프리미엄' : userInfo.grade}
              </Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>가입일</Typography>
              <Typography fontSize={18} fontWeight={600}>
                {userInfo.createdAt ? dayjs(userInfo.createdAt).format('YYYY년 MM월 DD일') : '-'}
              </Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>마지막 로그인</Typography>
              <Typography fontSize={18} fontWeight={600}>
                {userInfo.lastLoginAt ? dayjs(userInfo.lastLoginAt).format('YYYY년 MM월 DD일 HH:mm') : '-'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 사용 한도 현황 */}
        {usageLimits && (
          <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Typography fontSize={20} fontWeight={700} mb={3}>
              사용 한도 현황
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {/* 프로젝트 (채팅방) */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: usageLimits.projects.canCreate ? '#E8F5E9' : '#FFEBEE',
                border: `1px solid ${usageLimits.projects.canCreate ? '#4CAF50' : '#F44336'}`,
              }}>
                <Typography fontWeight={600} color={usageLimits.projects.canCreate ? 'success.main' : 'error.main'} mb={1}>
                  프로젝트 (채팅방)
                </Typography>
                <Typography fontSize={24} fontWeight={700} mb={1}>
                  {usageLimits.projects.remaining}개 남음
                </Typography>
                <Typography fontSize={14} color="grey.600">
                  {userInfo?.grade === 'basic' || userInfo?.grade === 'c' || userInfo?.grade === 'C' ? '총 1개 생성 가능' :
                   userInfo?.grade === 'pro' ? '총 4개 생성 가능' :
                   userInfo?.grade === 'business' ? '총 10개 생성 가능' : ''}
                </Typography>
              </Box>

              {/* 개별 이미지 */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: usageLimits.singleImages.canCreate ? '#E8F5E9' : '#FFEBEE',
                border: `1px solid ${usageLimits.singleImages.canCreate ? '#4CAF50' : '#F44336'}`,
              }}>
                <Typography fontWeight={600} color={usageLimits.singleImages.canCreate ? 'success.main' : 'error.main'} mb={1}>
                  개별 이미지
                </Typography>
                <Typography fontSize={24} fontWeight={700} mb={1}>
                  {usageLimits.singleImages.remaining}개 남음
                </Typography>
                <Typography fontSize={14} color="grey.600">
                  {userInfo?.grade === 'basic' || userInfo?.grade === 'c' || userInfo?.grade === 'C' ? '총 1개 생성 가능' :
                   userInfo?.grade === 'pro' ? '총 20개 생성 가능' :
                   userInfo?.grade === 'business' ? '총 100개 생성 가능' : ''}
                </Typography>
              </Box>

              {/* 콘텐츠 수정 */}
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: usageLimits.edits.canEdit ? '#E8F5E9' : '#FFEBEE',
                border: `1px solid ${usageLimits.edits.canEdit ? '#4CAF50' : '#F44336'}`,
              }}>
                <Typography fontWeight={600} color={usageLimits.edits.canEdit ? 'success.main' : 'error.main'} mb={1}>
                  콘텐츠 수정 (오늘)
                </Typography>
                <Typography fontSize={24} fontWeight={700} mb={1}>
                  {usageLimits.edits.remainingToday === null ? '무제한' : `${usageLimits.edits.remainingToday}회 남음`}
                </Typography>
                <Typography fontSize={14} color="grey.600">
                  {userInfo?.grade === 'basic' || userInfo?.grade === 'c' || userInfo?.grade === 'C' ? '수정 불가' :
                   userInfo?.grade === 'pro' ? '하루 5회 수정 가능' :
                   userInfo?.grade === 'business' ? '무제한 수정 가능' : ''}
                </Typography>
              </Box>
            </Box>

            {/* 한도 초과 시 업그레이드 메시지 */}
            {(!usageLimits.projects.canCreate || !usageLimits.singleImages.canCreate || !usageLimits.edits.canEdit) && 
             (userInfo?.grade === 'basic' || userInfo?.grade === 'c' || userInfo?.grade === 'C' || userInfo?.grade === 'pro') && (
              <Alert severity="info" sx={{ mt: 3 }}>
                한도를 모두 사용하셨나요? 
                <Box component="span" sx={{ fontWeight: 600, cursor: 'pointer', color: 'primary.main' }} onClick={() => router.push('/subscribe')}>
                  {' '}플랜을 업그레이드
                </Box>
                하여 더 많은 콘텐츠를 생성하세요!
              </Alert>
            )}
          </Paper>
        )}

        {/* 취소된 구독 알림 */}
        {userInfo.grade === 'pro' && userInfo.membershipStatus === 'cancelled' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            구독이 취소되었습니다. {userInfo.membershipEndDate ? 
              `${dayjs(userInfo.membershipEndDate).format('YYYY년 MM월 DD일')}까지 서비스를 이용하실 수 있습니다.` : 
              '현재 결제 기간이 끝날 때까지 서비스를 이용하실 수 있습니다.'}
          </Alert>
        )}

        {/* 현재 구독 정보 - 프로 회원만 표시 */}
        {userInfo.grade === 'pro' && (
          <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography fontSize={24} fontWeight={700}>
                프로 멤버십
              </Typography>
              <Chip 
                label={
                  userInfo.membershipStatus === 'cancelled' ? '취소됨' : 
                  userInfo.membershipStatus === 'expired' ? '만료됨' : 
                  '활성'
                } 
                color={
                  userInfo.membershipStatus === 'cancelled' ? 'warning' : 
                  userInfo.membershipStatus === 'expired' ? 'error' : 
                  'success'
                } 
                sx={{ fontWeight: 600 }}
              />
            </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography color="grey.600" mb={1}>월 이용료</Typography>
              <Typography fontSize={20} fontWeight={600}>₩9,900</Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>다음 결제일</Typography>
              <Typography fontSize={20} fontWeight={600}>
                {subscriptionInfo?.nextBillingDate 
                  ? dayjs(subscriptionInfo.nextBillingDate).format('YYYY년 MM월 DD일')
                  : '-'}
              </Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>시작일</Typography>
              <Typography fontSize={20} fontWeight={600}>
                {subscriptionInfo?.startDate 
                  ? dayjs(subscriptionInfo.startDate).format('YYYY년 MM월 DD일')
                  : '-'}
              </Typography>
            </Box>
            <Box>
              <Typography color="grey.600" mb={1}>결제 상태</Typography>
              <Typography fontSize={20} fontWeight={600} color="success.main">
                정상
              </Typography>
            </Box>
          </Box>
        </Paper>
        )}

        {/* 결제 정보 - 프로 회원만 표시 */}
        {userInfo.grade === 'pro' && (
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Typography fontSize={20} fontWeight={700} mb={3}>
            결제 정보
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {billingInfo ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="grey.600" mb={1}>등록된 카드</Typography>
                <Typography fontSize={18} fontWeight={600}>
                  {billingInfo.cardName} ({billingInfo.cardNumber})
                </Typography>
              </Box>
              <UnifiedButton variant="white" onClick={handleUpdatePaymentMethod}>
                결제 수단 변경
              </UnifiedButton>
            </Box>
          ) : (
            <Alert severity="warning">
              등록된 결제 수단이 없습니다.
            </Alert>
          )}
        </Paper>
        )}

        {/* 멤버십 혜택 - 프로 회원만 표시 */}
        {userInfo.grade === 'pro' && (
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Typography fontSize={20} fontWeight={700} mb={3}>
            프로 멤버십 혜택
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontSize={18}>✓</Typography>
              <Typography>프로젝트 (채팅방) 생성: 총 4개</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontSize={18}>✓</Typography>
              <Typography>개별 이미지 생성: 총 20개 (프로젝트당 5개)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontSize={18}>✓</Typography>
              <Typography>콘텐츠 수정: 하루 5회</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontSize={18}>✓</Typography>
              <Typography>자동 결제로 편리한 이용</Typography>
            </Box>
          </Box>
        </Paper>
        )}

        {/* 베이직 회원 현재 플랜 정보 */}
        {(userInfo.grade === 'basic' || userInfo.grade === 'c' || userInfo.grade === 'C') && (
          <>
            <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
              <Typography fontSize={20} fontWeight={700} mb={3}>
                현재 멤버십
              </Typography>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography fontSize={24} fontWeight={700}>
                  베이직 플랜 (무료)
                </Typography>
                <Chip 
                  label="활성" 
                  color="success" 
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <Typography fontWeight={600} mb={2}>현재 이용 중인 혜택:</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={18}>✓</Typography>
                  <Typography>프로젝트 (채팅방) 생성: 총 1개</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={18}>✓</Typography>
                  <Typography>개별 이미지 생성: 총 1개</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={18}>✓</Typography>
                  <Typography>콘텐츠 수정: 불가</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontSize={18}>✓</Typography>
                  <Typography>무료로 시작하기</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 3, borderRadius: 3, bgcolor: '#FFF3E0', border: '2px solid #FFA726' }}>
              <Typography fontSize={20} fontWeight={700} mb={3}>
                프로 멤버십으로 업그레이드하세요! 🚀
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography fontWeight={600} color="grey.700" mb={1}>현재 베이직 플랜</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography fontSize={14}>• 프로젝트 생성: 1개</Typography>
                    <Typography fontSize={14}>• 개별 이미지: 1개</Typography>
                    <Typography fontSize={14}>• 콘텐츠 수정: 불가</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography fontWeight={600} color="#FF9800" mb={1}>프로 플랜 (₩9,900/월)</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography fontSize={14} color="#FF9800">• 프로젝트 생성: 4개 ↑</Typography>
                    <Typography fontSize={14} color="#FF9800">• 개별 이미지: 20개 ↑</Typography>
                    <Typography fontSize={14} color="#FF9800">• 콘텐츠 수정: 하루 5회 ↑</Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <UnifiedButton 
                  variant="colored" 
                  onClick={() => router.push('/subscribe')}
                  sx={{ minWidth: 200 }}
                >
                  프로 멤버십 시작하기
                </UnifiedButton>
              </Box>
            </Paper>
          </>
        )}

        {/* 비밀번호 변경 */}
        <Paper sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography fontSize={20} fontWeight={700}>
              비밀번호 변경
            </Typography>
            {!showPasswordChange && userInfo.authType === '이메일' && (
              <UnifiedButton 
                variant="white" 
                onClick={() => setShowPasswordChange(true)}
              >
                비밀번호 변경
              </UnifiedButton>
            )}
          </Box>
          
          {userInfo.authType !== '이메일' ? (
            <>
              <Divider sx={{ mb: 3 }} />
              <Typography color="grey.600">
                {userInfo.authType === '카카오' ? '카카오' : 
                 userInfo.authType === '구글' ? '구글' : userInfo.authType} 계정으로 로그인하셨습니다.
                비밀번호 변경은 이메일 로그인 사용자만 가능합니다.
              </Typography>
            </>
          ) : (
            showPasswordChange && (
              <>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ maxWidth: 400 }}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? "text" : "password"}
                    label="새 비밀번호"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError("");
                    }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label="새 비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError("");
                    }}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {passwordError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {passwordError}
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <UnifiedButton
                      variant="colored"
                      onClick={handlePasswordChange}
                    >
                      변경하기
                    </UnifiedButton>
                    <UnifiedButton
                      variant="white"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError("");
                      }}
                    >
                      취소
                    </UnifiedButton>
                  </Box>
                </Box>
              </>
            )
          )}
        </Paper>

        {/* 구독 취소 - 활성 구독이 있는 프로 회원만 표시 */}
        {userInfo.grade === 'pro' && userInfo.membershipStatus === 'active' && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <UnifiedButton 
            variant="white" 
            onClick={handleCancelSubscription}
            sx={{ color: 'error.main', borderColor: 'error.main' }}
          >
            구독 취소
          </UnifiedButton>
          <Typography color="grey.600" fontSize={14} mt={2}>
            구독을 취소하면 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.
          </Typography>
        </Box>
        )}
      </Box>
    </Box>
  );
}