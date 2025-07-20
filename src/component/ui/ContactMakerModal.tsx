import React, { useState } from "react";
import { Box, Button, Typography, Modal, TextField } from "@mui/material";
import emailjs from "emailjs-com";

const MESSAGE_TYPES = [
  "앱 오류 문의하기",
  "결제 관련 문의하기", 
  "개발자에게 의견 남기기",
  "카카오톡으로 빠른 문의",
];

export default function ContactMakerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleTypeSelect = (type: string) => {
    if (type === "카카오톡으로 빠른 문의") {
      window.open("http://pf.kakao.com/_CjqWn/chat", "_blank");
      handleClose();
      return;
    }
    setSelectedType(type);
    setStep(1);
  };

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    setSending(true);
    setError("");
    try {
      // Replace these with your actual EmailJS values
      const serviceId = "service_ovjg4lh";
      const templateId = "template_rr4danj";
      const userId = "3E9EuAAvdJW0hu3kQ";
      await emailjs.send(
        serviceId,
        templateId,
        {
          message_type: selectedType,
          message,
          name,
          email,
          time: new Date().toLocaleString('ko-KR'),
          to_email: "service@mond.io.kr",
        },
        userId
      );
      setSent(true);
    } catch (e) {
      setError("이메일 전송에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setSelectedType("");
    setName("");
    setEmail("");
    setMessage("");
    setSent(false);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#F5EFEA",
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 3, md: 4 },
          width: { xs: 320, md: 400 },
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        {step === 0 && (
          <>
            <Typography fontWeight={700} fontSize={24} align="center" mb={3}>
              어떤 메시지를 보낼까요?
            </Typography>
            {MESSAGE_TYPES.map((type) => (
              <Button
                key={type}
                fullWidth
                sx={{
                  bgcolor: type === "카카오톡으로 빠른 문의" ? "#FFF8E1" : "#fff",
                  color: type === "카카오톡으로 빠른 문의" ? "#F57C00" : "#222",
                  fontWeight: 700,
                  fontSize: 18,
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 0,
                  border: type === "카카오톡으로 빠른 문의" ? "1px solid #FFE0B2" : "none",
                  '&:hover': { 
                    bgcolor: type === "카카오톡으로 빠른 문의" ? "#FFE0B2" : "#f0e6d6" 
                  },
                }}
                onClick={() => handleTypeSelect(type)}
              >
                {type === "카카오톡으로 빠른 문의" ? "💬 " : ""}{type}
              </Button>
            ))}
          </>
        )}
        {step === 1 && !sent && (
          <>
            <Typography fontWeight={700} fontSize={20} align="center" mb={2}>
              {selectedType}
            </Typography>
            
            <TextField
              fullWidth
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              inputProps={{ maxLength: 50 }}
            />
            
            <TextField
              fullWidth
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              inputProps={{ maxLength: 100 }}
            />
            
            <TextField
              multiline
              minRows={4}
              maxRows={8}
              fullWidth
              placeholder="메시지를 입력해주세요."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2, bgcolor: "#fff", borderRadius: 2 }}
              inputProps={{ maxLength: 1000 }}
            />
            {error && (
              <Typography color="error" mb={1} fontSize={14} align="center">
                {error}
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              sx={{ fontWeight: 700, fontSize: 18, mb: 1, borderRadius: 2 }}
              onClick={handleSend}
              disabled={sending || !name.trim() || !email.trim() || !message.trim()}
            >
              {sending ? "전송 중..." : "보내기"}
            </Button>
            <Button fullWidth sx={{ fontWeight: 700, borderRadius: 2 }} onClick={handleClose}>
              취소
            </Button>
          </>
        )}
        {sent && (
          <>
            <Typography fontWeight={700} fontSize={20} align="center" mb={2}>
              메시지가 전송되었습니다!
            </Typography>
            <Button fullWidth sx={{ fontWeight: 700, borderRadius: 2 }} onClick={handleClose}>
              닫기
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
} 