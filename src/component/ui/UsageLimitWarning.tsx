import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Alert } from "@mui/material";
import UnifiedButton from "./UnifiedButton";
import { useRouter } from "next/router";

interface UsageLimitWarningProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'project' | 'single_image' | 'content_edit';
  remaining: number;
  canPerform: boolean;
  userGrade?: string;
}

const typeConfig = {
  project: {
    title: '프로젝트 생성',
    resource: '프로젝트',
    basic: { total: 1, upgrade: 'pro' },
    pro: { total: 4, upgrade: 'business' },
    business: { total: 10, upgrade: null }
  },
  single_image: {
    title: '개별 이미지 생성',
    resource: '개별 이미지',
    basic: { total: 1, upgrade: 'pro' },
    pro: { total: 20, upgrade: 'business' },
    business: { total: 100, upgrade: null }
  },
  content_edit: {
    title: '콘텐츠 수정',
    resource: '수정 횟수',
    basic: { total: 0, upgrade: 'pro' },
    pro: { total: 5, upgrade: 'business', isDaily: true },
    business: { total: -1, upgrade: null } // -1 means unlimited
  }
};

export default function UsageLimitWarning({
  open,
  onClose,
  onConfirm,
  type,
  remaining,
  canPerform,
  userGrade = 'basic'
}: UsageLimitWarningProps) {
  const router = useRouter();
  const config = typeConfig[type];
  const gradeKey = userGrade === 'c' || userGrade === 'C' ? 'basic' : userGrade;
  const gradeConfig = config[gradeKey as keyof typeof config] || config.basic;

  const handleUpgrade = () => {
    router.push('/subscribe');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontSize={20} fontWeight={700}>
          {config.title} 한도 확인
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {canPerform ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography fontWeight={600} mb={1}>
                {config.resource} 사용 가능 횟수: {remaining}회
              </Typography>
              <Typography fontSize={14}>
                {type === 'content_edit' && typeof gradeConfig === 'object' && 'isDaily' in gradeConfig && gradeConfig.isDaily 
                  ? `오늘 ${remaining}회 더 수정할 수 있습니다.`
                  : `${remaining}개의 ${config.resource}를 더 생성할 수 있습니다.`}
              </Typography>
            </Alert>
            
            {remaining <= 1 && (
              <Alert severity="warning">
                <Typography fontSize={14}>
                  곧 한도에 도달합니다. 계속 사용하시려면 플랜 업그레이드를 고려해보세요.
                </Typography>
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography fontWeight={600} mb={1}>
                {config.resource} 한도에 도달했습니다
              </Typography>
              <Typography fontSize={14}>
                {type === 'content_edit' && gradeKey === 'basic'
                  ? '베이직 플랜에서는 콘텐츠 수정이 불가능합니다.'
                  : type === 'content_edit' && typeof gradeConfig === 'object' && 'isDaily' in gradeConfig && gradeConfig.isDaily
                  ? '오늘의 수정 한도를 모두 사용하셨습니다. 내일 다시 시도해주세요.'
                  : `더 이상 ${config.resource}를 생성할 수 없습니다.`}
              </Typography>
            </Alert>

            {typeof gradeConfig === 'object' && 'upgrade' in gradeConfig && gradeConfig.upgrade && (
              <Box sx={{ p: 3, bgcolor: '#FFF3E0', borderRadius: 2, textAlign: 'center' }}>
                <Typography fontWeight={600} mb={2}>
                  {typeof gradeConfig === 'object' && 'upgrade' in gradeConfig && gradeConfig.upgrade === 'pro' ? '프로' : '비즈니스'} 플랜으로 업그레이드하세요!
                </Typography>
                <Typography fontSize={14} color="grey.600" mb={2}>
                  {typeof gradeConfig === 'object' && 'upgrade' in gradeConfig && gradeConfig.upgrade === 'pro' 
                    ? type === 'project' ? '프로젝트를 4개까지 생성할 수 있습니다.'
                    : type === 'single_image' ? '개별 이미지를 20개까지 생성할 수 있습니다.'
                    : '하루에 5회까지 콘텐츠를 수정할 수 있습니다.'
                    : type === 'project' ? '프로젝트를 10개까지 생성할 수 있습니다.'
                    : type === 'single_image' ? '개별 이미지를 100개까지 생성할 수 있습니다.'
                    : '무제한으로 콘텐츠를 수정할 수 있습니다.'}
                </Typography>
                <UnifiedButton 
                  variant="colored" 
                  onClick={handleUpgrade}
                  sx={{ minWidth: 150 }}
                >
                  업그레이드하기
                </UnifiedButton>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        {canPerform ? (
          <>
            <UnifiedButton variant="white" onClick={onClose}>
              취소
            </UnifiedButton>
            <UnifiedButton variant="colored" onClick={onConfirm}>
              계속하기
            </UnifiedButton>
          </>
        ) : (
          <UnifiedButton variant="white" onClick={onClose}>
            닫기
          </UnifiedButton>
        )}
      </DialogActions>
    </Dialog>
  );
}