import { Box, Button, Typography, CircularProgress, TextField } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { primaryColor } from "@/constant/styles/styleTheme";
import { TitleTypo28 } from "@/component/ui/styled/StyledTypography";
import imageCompression from "browser-image-compression";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { apiCall } from "@/module/utils/api";
import { BaseModalBox } from "@/component/ui/Modal";
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface OnboardingStep5Props {
  hasUrl: boolean | null;
  setImages: Function;
  images: File[];
  scrapedImages: File[];
  setScrapedImages: Function;
  brandInput: any;
  selectedImages: Set<string>;
  setSelectedImages: (value: Set<string>) => void;
}

export default function OnboardingStep5({
  hasUrl,
  setImages,
  images,
  scrapedImages,
  setScrapedImages,
  brandInput,
  selectedImages,
  setSelectedImages,
}: OnboardingStep5Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [editingImage, setEditingImage] = useState<{ file: File; index: number } | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [isAddingNewLink, setIsAddingNewLink] = useState(false);
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [showAddLinkBox, setShowAddLinkBox] = useState(false);
  const [newLink, setNewLink] = useState('');

  // Function to scrape images from a specific URL
  const scrapeImagesFromUrl = async (url: string, isAdditional: boolean = false) => {
    if (isAdditional) {
      setIsAddingNewLink(true);
    } else {
      setIsScraping(true);
    }
    try {
      const response = await apiCall({
        url: "/content/scrape-images",
        method: "post",
        body: {
          url: url,
        },
      });

      if (response.data.images && response.data.images.length > 0) {
        // Convert base64 images to File objects
        const imageFiles = await Promise.all(
          response.data.images.map(async (imageData: string, index: number) => {
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // Extract the actual image type from the data URL
            let mimeType = 'image/jpeg'; // default
            let extension = 'jpg'; // default
            
            if (imageData.startsWith('data:')) {
              const mimeMatch = imageData.match(/data:([^;]+);/);
              if (mimeMatch) {
                mimeType = mimeMatch[1];
                // Determine extension based on MIME type
                if (mimeType === 'image/png') extension = 'png';
                else if (mimeType === 'image/gif') extension = 'gif';
                else if (mimeType === 'image/webp') extension = 'webp';
                else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') extension = 'jpg';
              }
            }
            
            const fileName = isAdditional 
              ? `additional-scraped-image-${Date.now()}-${index}.${extension}`
              : `scraped-image-${index}.${extension}`;
            return new File([blob], fileName, {
              type: mimeType,
            });
          })
        );

        if (isAdditional) {
          // Add to existing scraped images
          setScrapedImages((prev: File[]) => [...prev, ...imageFiles]);
        } else {
          // Replace scraped images (for main URL)
          setScrapedImages(imageFiles);
          
          // Auto-select first 5 scraped images
          const newSelectedImages = new Set(selectedImages);
          const currentCount = newSelectedImages.size;
          const availableSlots = Math.max(0, 5 - currentCount);
          const imagesToSelect = Math.min(5, imageFiles.length, availableSlots);
          
          for (let i = 0; i < imagesToSelect; i++) {
            newSelectedImages.add(`scraped-${i}`);
          }
          
          setSelectedImages(newSelectedImages);
        }
      } else {
        if (!isAdditional) {
          // Clear scraped images if no images were found (only for main URL)
          setScrapedImages([]);
        }
        alert("해당 링크에서 이미지를 찾을 수 없습니다.");
      }
    } catch (error) {
      // Error handling for image scraping
    } finally {
      if (isAdditional) {
        setIsAddingNewLink(false);
      } else {
        setIsScraping(false);
      }
    }
  };

  // Main URL change effect - only scrape when URL changes
  useEffect(() => {
    if (hasUrl && brandInput.url) {
      // Clear old scraped images and their selections when URL changes
      setScrapedImages([]);
      setAdditionalLinks([]);
      const newSelectedImages = new Set(selectedImages);
      const oldScrapedKeys = Array.from(selectedImages).filter(key => key.startsWith('scraped-'));
      oldScrapedKeys.forEach(key => newSelectedImages.delete(key));
      setSelectedImages(newSelectedImages);
      
      // Scrape images from the new URL
      scrapeImagesFromUrl(brandInput.url, false);
    } else if (!hasUrl) {
      // Clear scraped images when hasUrl becomes false
      setScrapedImages([]);
      setAdditionalLinks([]);
      // Clear selected images that were from scraped images
      const newSelectedImages = new Set(selectedImages);
      const oldScrapedKeys = Array.from(selectedImages).filter(key => key.startsWith('scraped-'));
      oldScrapedKeys.forEach(key => newSelectedImages.delete(key));
      setSelectedImages(newSelectedImages);
    }
  }, [hasUrl, brandInput.url]);

  // Function to add additional link
  const handleAddLink = async () => {
    if (!newLink.trim()) {
      alert("링크를 입력해주세요.");
      return;
    }
    
    if (!newLink.includes("http")) {
      alert("올바른 링크를 입력해주세요.");
      return;
    }

    if (additionalLinks.includes(newLink)) {
      alert("이미 추가된 링크입니다.");
      return;
    }

    // Add link to additional links list
    setAdditionalLinks((prev: string[]) => [...prev, newLink]);
    
    // Scrape images from the new link
    await scrapeImagesFromUrl(newLink, true);
    
    // Clear the input and hide the box
    setNewLink('');
    setShowAddLinkBox(false);
  };

  // Function to remove additional link
  const handleRemoveLink = (linkToRemove: string) => {
    setAdditionalLinks((prev: string[]) => prev.filter(link => link !== linkToRemove));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    // Filter out already existing files based on name
    const filteredFiles = selectedFiles.filter(
      (file) => !images.some((img) => img.name === file.name)
    );

    // Compress images larger than 2MB
    const options = {
      maxSizeMB: 2,
      useWebWorker: true,
    };
    const compressedFiles = await Promise.all(
      filteredFiles.map((file) =>
        file.size > 2 * 1024 * 1024 ? imageCompression(file, options) : file
      )
    );

    if (compressedFiles.length < selectedFiles.length) {
      alert("이미 업로드한 이미지가 포함되어 있습니다.");
    }
    
    const currentImageCount = images.length;
    setImages((prev: File[]) => [...prev, ...compressedFiles]);

    // Auto-select newly uploaded images if we have less than 5 total selected
    const newSelectedImages = new Set(selectedImages);
    const currentSelectedCount = newSelectedImages.size;
    const availableSlots = Math.max(0, 5 - currentSelectedCount);
    
    if (availableSlots > 0) {
      const imagesToSelect = Math.min(compressedFiles.length, availableSlots);
      for (let i = 0; i < imagesToSelect; i++) {
        newSelectedImages.add(`manual-${currentImageCount + i}`);
      }
      setSelectedImages(newSelectedImages);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelection = (imageKey: string) => {
    const newSelectedImages = new Set(selectedImages);
    if (newSelectedImages.has(imageKey)) {
      newSelectedImages.delete(imageKey);
    } else {
      if (newSelectedImages.size >= 5) {
        alert("최대 5장까지만 선택할 수 있습니다.");
        return;
      }
      newSelectedImages.add(imageKey);
    }
    setSelectedImages(newSelectedImages);
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev: File[]) => prev.filter((_, i) => i !== idx));
    
    // Update selected images indices after removal
    const newSelectedImages = new Set<string>();
    selectedImages.forEach(key => {
      if (key.startsWith('manual-')) {
        const index = parseInt(key.split('-')[1]);
        if (index < idx) {
          newSelectedImages.add(key);
        } else if (index > idx) {
          newSelectedImages.add(`manual-${index - 1}`);
        }
        // Skip the removed index
      } else {
        // Keep scraped image selections
        newSelectedImages.add(key);
      }
    });
    
    setSelectedImages(newSelectedImages);
  };

  const handleEditImage = (file: File, index: number) => {
    setEditingImage({ file, index });
    // Reset crop state when opening modal
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5,
    });
    setCompletedCrop(null);
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current || !editingImage) {
      alert("크롭 영역을 선택해주세요.");
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert("캔버스를 생성할 수 없습니다.");
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas dimensions to the actual pixel size of the crop area
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Draw the cropped image onto the canvas without distortion
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("이미지 처리에 실패했습니다.");
          resolve();
          return;
        }

        const newFile = new File([blob], editingImage.file.name, {
          type: editingImage.file.type,
        });

        // Determine if this is a manual or scraped image
        const isScrapedImage = editingImage.index >= 0 && editingImage.index < scrapedImages.length;
        
        if (isScrapedImage) {
          // Update scraped images
          setScrapedImages((prev: File[]) => {
            const updated = [...prev];
            updated[editingImage.index] = newFile;
            return updated;
          });
        } else {
          // Update manual images
          setImages((prev: File[]) => {
            const updated = [...prev];
            updated[editingImage.index] = newFile;
            return updated;
          });
        }

        setEditingImage(null);
        setCompletedCrop(null);
        resolve();
      }, editingImage.file.type, 0.95);
    });
  };

  // Function to get image URL for display
  const getImageUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <>
      {hasUrl === false ? (
        <TitleTypo28 align="center" lineHeight={1.4}>
          링크가 없다면 상품, 서비스를 대표하는
          <span style={{ color: primaryColor }}> 이미지</span>를
          <br />
          <span style={{ color: primaryColor }}>1장 이상 업로드</span>해주세요.
        </TitleTypo28>
      ) : (
        <TitleTypo28 align="center" lineHeight={1.4}>
          링크와 더불어 상품, 서비스를 대표하는
          <span style={{ color: primaryColor }}> 이미지</span>를
          <br />
          <span style={{ color: primaryColor }}>1장 이상 업로드</span>해주세요.
        </TitleTypo28>
      )}

      <Typography
        align="center"
        lineHeight={1.55}
        sx={{ 
          mt: "20px", 
          mb: "20px",
          fontSize: { xs: "14px", md: "16px" },
          color: "#666",
          maxWidth: "600px",
          mx: "auto"
        }}
      >
        {hasUrl === false ? (
          <>
            필수는 아니지만 내 서비스와 상품의 연출컷, 대표 이미지 등을 1장 이상 삽입하면 나의 서비스와 상품 홍보에 더욱 적합한 콘텐츠를 얻으실 수 있어요!
            <br />
            <span style={{ color: primaryColor, fontWeight: 600 }}>ex) 서비스/상품/로고/인물의 누끼사진, 대표 연출컷 등</span>
          </>
        ) : (
          <>
            링크에서 자동으로 이미지를 추출하고, 추가로 더 많은 이미지를 업로드할 수 있어요!
            <br />
            내 서비스와 상품의 연출컷, 대표 이미지 등을 추가하면 더욱 적합한 콘텐츠를 얻으실 수 있어요!
            <br />
            <span style={{ color: primaryColor, fontWeight: 600 }}>ex) 서비스/상품/로고/인물의 누끼사진, 대표 연출컷 등</span>
          </>
        )}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
      >
        {/* Manually Added Images Section */}
        <Box sx={{ width: "100%", mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              직접 추가한 이미지
            </Typography>
            <Button
              variant="outlined"
              size="small"
              disableElevation
              disableRipple
              onClick={() => fileInputRef.current?.click()}
              sx={{
                height: "32px",
                lineHeight: "32px",
                padding: "0 14px",
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "8px",
                border: "1px solid",
                borderColor: primaryColor,
                backgroundColor: "#fff",
                color: primaryColor,
                boxSizing: "border-box",
                textTransform: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "none",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#fff",
                  borderColor: primaryColor,
                },
              }}
            >
              이미지 추가
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </Box>
          {images.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {images.map((img, idx) => {
                const imageKey = `manual-${idx}`;
                const isSelected = selectedImages.has(imageKey);
                return (
                  <Box
                    key={`${img.name}-${idx}-${img.lastModified}`}
                    onClick={() => handleImageSelection(imageKey)}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      overflow: "hidden",
                      position: "relative",
                      border: `2px solid ${isSelected ? primaryColor : "#eee"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fafafa",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: isSelected ? primaryColor : "#ccc",
                      },
                    }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`preview-${idx}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    {/* Selection Checkbox */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        left: 4,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: isSelected ? primaryColor : "rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: `2px solid ${isSelected ? primaryColor : "#ccc"}`,
                        zIndex: 3,
                      }}
                    >
                      {isSelected && <CheckIcon sx={{ fontSize: 16, color: "white" }} />}
                    </Box>
                    <Box sx={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 0.5 }}>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditImage(img, idx);
                        }}
                        sx={{
                          minWidth: 0,
                          width: 24,
                          height: 24,
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          borderRadius: "50%",
                          p: 0,
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            background: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </Button>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        sx={{
                          minWidth: 0,
                          width: 24,
                          height: 24,
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          borderRadius: "50%",
                          p: 0,
                          zIndex: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1,
                          "&:hover": {
                            background: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* Divider */}
        {hasUrl && (
          <Box sx={{ 
            width: "100%", 
            height: "1px", 
            backgroundColor: "#E0E0E0", 
            my: 3 
          }} />
        )}

        {/* Automatically Loaded Images Section */}
        {hasUrl && (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                링크에서 자동으로 추출된 이미지
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disableElevation
                disableRipple
                onClick={() => setShowAddLinkBox(true)}
                sx={{
                  height: "32px",
                  lineHeight: "32px",
                  padding: "0 14px",
                  fontSize: "14px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: primaryColor,
                  backgroundColor: "#fff",
                  color: primaryColor,
                  boxSizing: "border-box",
                  textTransform: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "none",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#fff",
                    borderColor: primaryColor,
                  },
                }}
              >
                링크 추가
              </Button>
            </Box>

            {/* Initial loading indicator for main URL */}
            {isScraping && scrapedImages.length === 0 && (
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                justifyContent: "center", 
                gap: 2, 
                py: 4,
                px: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
                border: `1px solid ${primaryColor}20`
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <CircularProgress size={24} sx={{ color: primaryColor }} />
                  <Typography sx={{ 
                    fontWeight: 600, 
                    color: primaryColor,
                    fontSize: { xs: "15px", md: "16px" }
                  }}>
                    링크에서 이미지를 추출하고 있습니다...
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ 
                  textAlign: "center",
                  color: "#666",
                  fontSize: { xs: "13px", md: "14px" }
                }}>
                  추출이 완료되는 동안 다른 이미지도 업로드할 수 있습니다
                </Typography>
              </Box>
            )}

            {/* Add Link Box */}
            {showAddLinkBox && (
              <Box sx={{ mb: 3, p: 2, border: "1px solid #E0E0E0", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  추가 링크 입력
                </Typography>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    placeholder="https:// "
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddLink();
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={handleAddLink}
                    disabled={isAddingNewLink}
                    sx={{ 
                      height: "40px",
                      px: 2,
                      py: 0.5,
                      fontSize: "14px"
                    }}
                  >
                    {isAddingNewLink ? "추출 중..." : "추가"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setShowAddLinkBox(false);
                      setNewLink('');
                    }}
                    sx={{ 
                      height: "40px",
                      px: 2,
                      py: 0.5,
                      fontSize: "14px"
                    }}
                  >
                    취소
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  예시: https://youtube.com/yourchannel, https://instagram.com/yourbrand
                </Typography>
              </Box>
            )}

            {/* Loading indicator for adding new links */}
            {isAddingNewLink && (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: 2, 
                py: 2,
                px: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
                border: `1px solid ${primaryColor}20`,
                mb: 2
              }}>
                <CircularProgress size={20} sx={{ color: primaryColor }} />
                <Typography sx={{ 
                  fontWeight: 600, 
                  color: primaryColor,
                  fontSize: { xs: "14px", md: "15px" }
                }}>
                  추가 링크에서 이미지를 추출하고 있습니다...
                </Typography>
              </Box>
            )}
            
            {/* Show scraped images or "no images" message only when not scraping */}
            {!isScraping && (
              scrapedImages.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {scrapedImages.map((img, idx) => {
                    const imageKey = `scraped-${idx}`;
                    const isSelected = selectedImages.has(imageKey);
                    return (
                      <Box
                        key={`${img.name}-${idx}-${img.lastModified}`}
                        onClick={() => handleImageSelection(imageKey)}
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                          border: `2px solid ${isSelected ? primaryColor : "#eee"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            borderColor: isSelected ? primaryColor : "#ccc",
                          },
                        }}
                      >
                        <img
                          src={getImageUrl(img)}
                          alt={`scraped-preview-${idx}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        {/* Selection Checkbox */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 4,
                            left: 4,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: isSelected ? primaryColor : "rgba(255,255,255,0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px solid ${isSelected ? primaryColor : "#ccc"}`,
                            zIndex: 3,
                          }}
                        >
                          {isSelected && <CheckIcon sx={{ fontSize: 16, color: "white" }} />}
                        </Box>
                        <Box sx={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 0.5 }}>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingImage({ file: img, index: idx });
                              setCrop({
                                unit: '%',
                                width: 90,
                                height: 90,
                                x: 5,
                                y: 5,
                              });
                              setCompletedCrop(null);
                            }}
                            sx={{
                              minWidth: 0,
                              width: 24,
                              height: 24,
                              background: "rgba(0,0,0,0.5)",
                              color: "white",
                              borderRadius: "50%",
                              p: 0,
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "&:hover": {
                                background: "rgba(0,0,0,0.7)",
                              },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </Button>
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const imageKey = `scraped-${idx}`;
                              setScrapedImages((prev: File[]) => prev.filter((_, i) => i !== idx));
                              // Remove from selected images if it was selected
                              if (selectedImages.has(imageKey)) {
                                const newSelectedImages = new Set(selectedImages);
                                newSelectedImages.delete(imageKey);
                                setSelectedImages(newSelectedImages);
                              }
                            }}
                            sx={{
                              minWidth: 0,
                              width: 24,
                              height: 24,
                              background: "rgba(0,0,0,0.5)",
                              color: "white",
                              borderRadius: "50%",
                              p: 0,
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 18,
                              lineHeight: 1,
                              "&:hover": {
                                background: "rgba(0,0,0,0.7)",
                              },
                            }}
                          >
                            ×
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                  링크에서 추출된 이미지가 없습니다.
                </Typography>
              )
            )}

            {/* Additional Links Display */}
            {additionalLinks.length > 0 && (
              <Box sx={{ mt: 3, p: 2, border: "1px solid #E0E0E0", borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  추가된 링크들
                </Typography>
                {additionalLinks.map((link, idx) => (
                  <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: "#666", fontSize: "14px" }}>
                      {link}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleRemoveLink(link)}
                      sx={{ 
                        minWidth: 0,
                        color: "#999",
                        fontSize: "12px",
                        "&:hover": { color: "#f44336" }
                      }}
                    >
                      제거
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Image Edit Modal */}
      {editingImage && (
        <BaseModalBox
          modalSwitch={!!editingImage}
          setModalSwitch={() => {
            setEditingImage(null);
            setCompletedCrop(null);
          }}
          sx={{ maxWidth: "600px" }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              이미지 편집
            </Typography>
            <Typography sx={{ mb: 2 }}>
              이미지를 크롭하고 크기를 조정할 수 있습니다.
              <br />
              <strong>더 정확하게 크롭할수록 AI가 더 좋은 피드를 생성합니다!</strong>
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                minWidth={10}
                minHeight={10}
              >
                <img
                  ref={imgRef}
                  src={getImageUrl(editingImage.file)}
                  alt="edit"
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "400px",
                    height: "auto"
                  }}
                />
              </ReactCrop>
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button onClick={() => {
                setEditingImage(null);
                setCompletedCrop(null);
              }}>
                취소
              </Button>
              <Button 
                variant="contained" 
                onClick={handleCropComplete}
                disabled={!completedCrop || completedCrop.width === 0}
              >
                저장
              </Button>
            </Box>
          </Box>
        </BaseModalBox>
      )}
    </>
  );
}