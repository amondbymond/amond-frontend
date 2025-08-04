import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Button,
  Avatar,
  Tooltip,
  CircularProgress,
  Fade,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Backdrop,
} from "@mui/material";
import {
  Add as AddIcon,
  FolderOpen as FolderIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowRight as ChevronRightIcon,
  KeyboardArrowDown as ChevronDownIcon,
  Description as DescriptionIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "next/router";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { apiCall, handleAPIError } from "@/module/utils/api";
import moment from "moment";
import { IMAGES_PER_FEEDSET, CONTENT_TYPES } from "@/constant/commonVariable";
import { Chip, FormControl, InputLabel, Select, SelectChangeEvent, Grid, Switch, FormControlLabel, Card, CardContent } from "@mui/material";

interface ImageConfig {
  contentType: string;
  snsEvent: boolean;
  imageSize: string;
  additionalText: string;
}

interface Brand {
  brandId: string;
  name: string;
  category: string;
  url: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedSet {
  projectId: string;
  sessionName: string;
  imageList: string;
  reasonList: string;
  createdAt: string;
  lastAccessedAt: string;
  isActive: boolean;
}

interface ProjectSessionSidebarProps {
  currentProjectId?: string;
}

const drawerWidth = 252; // 210 * 1.2

export default function ProjectSessionSidebar({
  currentProjectId,
}: ProjectSessionSidebarProps) {
  const router = useRouter();
  const { userInfo } = useContext(LoginContext);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [feedSets, setFeedSets] = useState<{ [brandId: string]: FeedSet[] }>({});
  const [expandedBrands, setExpandedBrands] = useState<{ [brandId: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [brandMenuAnchor, setBrandMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [feedMenuAnchor, setFeedMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});
  const [feedSetModalOpen, setFeedSetModalOpen] = useState(false);
  const [selectedBrandForFeedSet, setSelectedBrandForFeedSet] = useState<Brand | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>([]);
  const [isCreatingFeedSet, setIsCreatingFeedSet] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [fullUserInfo, setFullUserInfo] = useState<any>(null);

  useEffect(() => {
    if (userInfo) {
      console.log("ProjectSessionSidebar: Loading brands for user", userInfo.id);
      console.log("ProjectSessionSidebar: userInfo from context:", userInfo);
      loadBrands();
      // Fetch full user info
      fetchFullUserInfo();
      // Force re-fetch after a delay to ensure backend is ready
      setTimeout(() => {
        fetchFullUserInfo();
      }, 1000);
    }
  }, [userInfo]);
  
  const fetchFullUserInfo = async () => {
    try {
      const response = await apiCall({
        url: "/auth/user",
        method: "get",
      });
      console.log("Full user info response:", response.data);
      // Temporary alert to debug
      if (response.data && response.data.name) {
        console.log("User has name:", response.data.name);
      } else {
        console.log("No name in response:", response.data);
      }
      setFullUserInfo(response.data);
    } catch (error) {
      console.error("Failed to fetch full user info:", error);
    }
  };

  // Listen for brand update events
  useEffect(() => {
    const handleBrandUpdate = async (event: any) => {
      console.log("Brand updated, refreshing sidebar...", event.detail);
      if (userInfo) {
        await loadBrands();
        
        // If we have specific project and content request info from the event, ensure it's selected
        const eventProjectId = event.detail?.projectId;
        const eventContentRequestId = event.detail?.contentRequestId;
        
        if (eventProjectId && eventContentRequestId) {
          // Wait a bit for feedSets to be populated
          setTimeout(() => {
            // Find which brand contains this project
            for (const [brandId, brandFeedSets] of Object.entries(feedSets)) {
              const hasFeedSet = brandFeedSets.some(fs => {
                if (fs.projectId.includes('_cr')) {
                  const [baseProjectId, crId] = fs.projectId.split('_cr');
                  return baseProjectId === eventProjectId && crId === String(eventContentRequestId);
                }
                return false;
              });
              
              if (hasFeedSet) {
                console.log(`Expanding brand ${brandId} for new content request`);
                setExpandedBrands(prev => ({ ...prev, [brandId]: true }));
                break;
              }
            }
          }, 500); // Give time for feedSets to update
        } else if (currentProjectId) {
          // Fallback to current project logic
          setTimeout(() => {
            for (const [brandId, brandFeedSets] of Object.entries(feedSets)) {
              const hasCurrentProject = brandFeedSets.some(fs => {
                if (fs.projectId.includes('_cr')) {
                  const [baseProjectId] = fs.projectId.split('_cr');
                  return baseProjectId === currentProjectId;
                }
                return fs.projectId === currentProjectId;
              });
              
              if (hasCurrentProject) {
                setExpandedBrands(prev => ({ ...prev, [brandId]: true }));
                break;
              }
            }
          }, 100);
        }
      }
    };

    window.addEventListener('brand-updated', handleBrandUpdate);

    return () => {
      window.removeEventListener('brand-updated', handleBrandUpdate);
    };
  }, [userInfo, currentProjectId]); // Remove feedSets from deps to avoid stale closure

  // Auto-expand brand containing current project when feedSets change
  useEffect(() => {
    if (currentProjectId && Object.keys(feedSets).length > 0) {
      const currentCr = router.query.cr;
      
      for (const [brandId, brandFeedSets] of Object.entries(feedSets)) {
        const hasCurrentFeedSet = brandFeedSets.some(fs => {
          if (currentCr && fs.projectId.includes('_cr')) {
            const [baseProjectId, crId] = fs.projectId.split('_cr');
            return baseProjectId === currentProjectId && crId === currentCr;
          }
          return fs.projectId === currentProjectId;
        });
        
        if (hasCurrentFeedSet) {
          setExpandedBrands(prev => ({ ...prev, [brandId]: true }));
          break;
        }
      }
    }
  }, [feedSets, currentProjectId, router.query.cr]);

  // Auto-select first project when on /project page with no specific project selected
  useEffect(() => {
    if (router.pathname === '/project' && !currentProjectId && brands.length > 0) {
      // Find the first brand with feedsets
      const firstBrandWithFeedsets = brands.find(b => feedSets[b.brandId]?.length > 0);
      if (firstBrandWithFeedsets) {
        const firstFeedSet = feedSets[firstBrandWithFeedsets.brandId][0];
        if (firstFeedSet) {
          handleSelectProject(firstFeedSet.projectId);
        }
      }
    }
  }, [router.pathname, currentProjectId, brands, feedSets]);

  const loadBrandsWithFallback = async () => {
    // Using fallback mode
    console.log("Using fallback mode (brand API not yet available)");
    setUsingFallback(true);
    
    const response = await apiCall({
      url: "/content/project/sessions",
      method: "get",
    });
    
    // Group sessions by unique brand key (name + category + url)
    const brandMap = new Map<string, any>();
    const sessions = response.data.sessions || [];
    
    sessions.forEach((session: any) => {
      // Create unique key based only on name to group all projects with same brand name
      // This prevents issues where slight URL differences create separate brands
      const brandKey = session.name;
      
      if (!brandMap.has(brandKey)) {
        brandMap.set(brandKey, {
          brandId: brandKey, // Use name as temporary ID
          name: session.name,
          category: session.category,
          url: session.url,
          description: "",
          createdAt: session.createdAt,
          updatedAt: session.createdAt,
        });
      } else {
        // Update brand info if this session is newer
        const existingBrand = brandMap.get(brandKey);
        if (moment(session.createdAt).isAfter(existingBrand.updatedAt)) {
          existingBrand.category = session.category;
          existingBrand.url = session.url;
          existingBrand.updatedAt = session.createdAt;
        }
      }
    });
    
    const brandsArray = Array.from(brandMap.values());
    setBrands(brandsArray);
    
    // Store sessions as feedsets
    const feedSetsByBrand: { [key: string]: any[] } = {};
    sessions.forEach((session: any) => {
      // Use same key as brand grouping (just the name)
      const brandKey = session.name;
      
      if (!feedSetsByBrand[brandKey]) {
        feedSetsByBrand[brandKey] = [];
      }
      feedSetsByBrand[brandKey].push({
        projectId: session.projectId,
        sessionName: session.sessionName || `${session.name} - ${moment(session.createdAt).format('YYYY-MM-DD HH:mm')}`,
        imageList: "",
        reasonList: "",
        createdAt: session.createdAt,
        lastAccessedAt: session.lastAccessedAt,
        isActive: session.isActive,
      });
    });
    
    setFeedSets(feedSetsByBrand);
    
    console.log("Fallback brands:", brandsArray);
    console.log("Fallback feedsets:", feedSetsByBrand);
    
    // Auto-expand the brand containing the current project
    if (currentProjectId) {
      for (const [brandId, brandFeedSets] of Object.entries(feedSetsByBrand)) {
        const hasCurrentProject = brandFeedSets.some((fs: any) => {
          if (fs.projectId.includes('_cr')) {
            const [baseProjectId] = fs.projectId.split('_cr');
            return baseProjectId === currentProjectId;
          }
          return fs.projectId === currentProjectId;
        });
        
        if (hasCurrentProject) {
          setExpandedBrands({ [brandId]: true });
          break;
        }
      }
    } else if (brandsArray.length > 0) {
      // If no current project, expand first brand with feedsets
      const firstBrandWithFeedsets = brandsArray.find(b => feedSetsByBrand[b.brandId]?.length > 0);
      if (firstBrandWithFeedsets) {
        setExpandedBrands({ [firstBrandWithFeedsets.brandId]: true });
      }
    }
    
    // Don't auto-select any project if we're on the index page
    if (router.pathname === '/project' && brandsArray.length === 0) {
      return;
    }
  };

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      
      // Force fallback mode until brand API is available on the server
      const forceFallback = true; // TODO: Remove this when server is updated with brand routes
      
      if (!forceFallback) {
        try {
          // Try the brand API
          const response = await apiCall({
            url: "/brand/brands",
            method: "get",
          });
          
          const brandsData = response.data.brands || [];
          setBrands(brandsData);
          console.log("Loaded brands from API:", brandsData);
        
        // Load all feedsets and wait for them to complete
        const feedSetsData: { [key: string]: FeedSet[] } = {};
        
        await Promise.all(
          brandsData.map(async (brand: Brand) => {
            try {
              console.log(`Loading feedsets for brand ${brand.brandId}...`);
              const feedsetsResponse = await apiCall({
                url: `/brand/${brand.brandId}/feedsets`,
                method: "get",
              });
              console.log(`Feedsets response for brand ${brand.name} (${brand.brandId}):`, feedsetsResponse.data);
              feedSetsData[brand.brandId] = feedsetsResponse.data.feedSets || [];
              console.log(`Stored ${feedSetsData[brand.brandId].length} feedsets for brand ${brand.name}`);
            } catch (e) {
              console.log(`Failed to load feedsets for brand ${brand.brandId}:`, e);
              feedSetsData[brand.brandId] = [];
            }
          })
        );
        
        console.log("Loaded feedsets data:", feedSetsData);
        setFeedSets(feedSetsData);
        setUsingFallback(false);
        
        // Auto-expand first brand
        if (brandsData.length > 0) {
          setExpandedBrands({ [brandsData[0].brandId]: true });
        }
        } catch (error: any) {
          console.log("Brand API not available, falling back to session mode", error);
          // Fall back to session mode
          await loadBrandsWithFallback();
          return;
        }
      } else {
        await loadBrandsWithFallback();
      }
    } catch (error) {
      console.error("Failed to load brands:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeedSets = async (brandId: string) => {
    // Skip if using fallback or feedsets already loaded
    if (usingFallback || feedSets[brandId]) {
      return;
    }
    
    try {
      const response = await apiCall({
        url: `/brand/${brandId}/feedsets`,
        method: "get",
      });
      setFeedSets(prev => ({
        ...prev,
        [brandId]: response.data.feedSets || []
      }));
    } catch (error) {
      console.error("Failed to load feed sets:", error);
    }
  };

  const toggleBrand = async (brandId: string) => {
    const isExpanded = expandedBrands[brandId];
    setExpandedBrands(prev => ({
      ...prev,
      [brandId]: !isExpanded
    }));
    
    // Only load feedsets if not using fallback and not already loaded
    if (!isExpanded && !feedSets[brandId] && !usingFallback) {
      await loadFeedSets(brandId);
    }
  };

  const handleNewProject = () => {
    router.push("/");
  };

  const handleSelectProject = (projectId: string) => {
    // Extract the actual project ID and content request ID
    if (projectId.includes('_cr')) {
      const [actualProjectId, contentRequestId] = projectId.split('_cr');
      router.push(`/project/${actualProjectId}?cr=${contentRequestId}`);
    } else {
      router.push(`/project/${projectId}`);
    }
  };

  const handleNewFeedSet = async (brandId: string) => {
    // Get the brand details
    const brand = brands.find(b => b.brandId === brandId);
    if (!brand) return;
    
    // Open modal for additional instructions
    setSelectedBrandForFeedSet(brand);
    setAdditionalInstructions("");
    setSelectedImageIndex(null);
    
    // Initialize 4 image configurations with default values
    const categoryContentTypes = CONTENT_TYPES[brand.category as keyof typeof CONTENT_TYPES] || CONTENT_TYPES['기타'];
    const defaultConfigs: ImageConfig[] = [];
    for (let i = 0; i < 4; i++) {
      defaultConfigs.push({
        contentType: categoryContentTypes[i] || '방향성 없음',
        snsEvent: false,
        imageSize: '1:1',
        additionalText: ''
      });
    }
    setImageConfigs(defaultConfigs);
    setFeedSetModalOpen(true);
  };

  const handleCreateFeedSet = async () => {
    if (!selectedBrandForFeedSet) return;
    
    try {
      setFeedSetModalOpen(false);
      setIsCreatingFeedSet(true);
      
      // For fallback mode, create a new project with existing brand info
      if (usingFallback) {
        // Find the feedsets for this brand
        const brandFeedSets = feedSets[selectedBrandForFeedSet.brandId] || [];
        
        if (brandFeedSets.length === 0) {
          alert("브랜드에 피드셋이 없습니다.");
          setIsCreatingFeedSet(false);
          return;
        }
        
        // Use the first feedset's project as template
        const templateFeedSet = brandFeedSets[0];
        
        // Navigate to the project page with auto-generate flag
        // The project page will handle content generation automatically
        const queryParams = new URLSearchParams();
        queryParams.append('autoGenerate', 'true');
        if (additionalInstructions) {
          queryParams.append('additionalInstructions', additionalInstructions);
        }
        // Pass individual image configurations
        queryParams.append('imageConfigs', JSON.stringify(imageConfigs));
        router.push(`/project/${templateFeedSet.projectId}?${queryParams.toString()}`);
        
        // Clear loading state after a brief delay
        setTimeout(() => {
          setIsCreatingFeedSet(false);
          setAdditionalInstructions("");
          setImageConfigs([]);
        }, 1000);
      } else {
        // Use brand API
        const response = await apiCall({
          url: `/brand/${selectedBrandForFeedSet.brandId}/feedset`,
          method: "post",
          body: {
            imageNameList: [], // Empty for auto-generation
            reasonList: [], // Use existing brand reasons
            autoGenerate: true,
            imageCount: IMAGES_PER_FEEDSET,
            additionalInstructions: additionalInstructions || undefined,
            imageConfigs: imageConfigs,
          },
        });
        
        const { projectId } = response.data;
        
        // Navigate to the new project with auto-generate flag
        // The project page will handle content generation
        router.push(`/project/${projectId}?autoGenerate=true`);
      }
      
      // Reload brands to show the new feedset
      await loadBrands();
      
    } catch (error: any) {
      console.error("Failed to create feedset:", error);
      if (error?.response?.status === 404) {
        alert("피드셋 생성 기능을 사용할 수 없습니다.");
      } else {
        handleAPIError(error, "피드셋 생성 실패");
      }
    } finally {
      setIsCreatingFeedSet(false);
    }
  };

  const formatDate = (date: string) => {
    const m = moment(date);
    if (m.isSame(moment(), "day")) {
      return m.format("HH:mm");
    } else if (m.isSame(moment(), "year")) {
      return m.format("MM/DD");
    } else {
      return m.format("YY/MM/DD");
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      if (usingFallback) {
        // In fallback mode, delete all projects with this brand composite key
        const brandFeedSets = feedSets[brandId] || [];
        
        for (const feedSet of brandFeedSets) {
          await apiCall({
            url: `/content/project/${feedSet.projectId}`,
            method: "delete",
          });
        }
        
        // Refresh the data
        await loadBrands();
        
        // Check if this was the last brand
        const remainingBrands = brands.filter(b => b.brandId !== brandId);
        if (remainingBrands.length === 0) {
          router.push("/project");
        }
      } else {
        // Use brand API when available
        await apiCall({
          url: `/brand/${brandId}`,
          method: "delete",
        });
        
        // Reload brands to get the updated list
        await loadBrands();
        
        // Check if this was the last brand
        const remainingBrands = brands.filter(b => b.brandId !== brandId);
        if (remainingBrands.length === 0) {
          router.push("/project");
        }
      }
    } catch (error: any) {
      console.error("Failed to delete brand:", error);
      if (error?.response?.status === 404) {
        alert("삭제 기능을 사용할 수 없습니다.");
      } else if (error?.response?.data?.error) {
        alert(`브랜드 삭제 실패: ${error.response.data.error}`);
      } else {
        alert("브랜드 삭제에 실패했습니다.");
      }
    }
  };

  const handleDeleteFeedSet = async (projectId: string) => {
    try {
      // Check if this is a content request (feed set) or a regular project
      if (projectId.includes('_cr')) {
        // Extract the content request ID
        const [actualProjectId, contentRequestId] = projectId.split('_cr');
        
        // Delete just the content request (feed set)
        await apiCall({
          url: `/content/contentrequest/${contentRequestId}`,
          method: "delete",
        });
        
        // If this was the current feed set, navigate away
        if (projectId === currentProjectId || 
            (actualProjectId === currentProjectId && router.query.cr === contentRequestId)) {
          await router.push("/project");
        }
      } else {
        // This is a regular project without content requests
        await apiCall({
          url: `/content/project/${projectId}`,
          method: "delete",
        });
        
        if (projectId === currentProjectId) {
          await router.push("/project");
        }
      }
      
      // Reload brands from server to get the updated state
      // This ensures we get the correct brand/feedset structure after deletion
      await loadBrands();
      
    } catch (error: any) {
      console.error("Failed to delete feedset:", error);
      if (error?.response?.status === 404) {
        alert("삭제 기능을 사용할 수 없습니다.");
      } else if (error?.response?.data?.error) {
        alert(`피드셋 삭제 실패: ${error.response.data.error}`);
      } else {
        alert("피드셋 삭제에 실패했습니다.");
      }
    }
  };


  const handleLogout = async () => {
    try {
      await apiCall({
        url: "/auth/logout",
        method: "post",
      });
      localStorage.removeItem("amondSessionToken");
      router.push("/login");
    } catch (e) {
      alert(`로그아웃을 하는데 문제가 생겼습니다.\n${e}`);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#FFF3E0",
            borderRight: "1px solid #FFE0B2",
            transition: "width 0.2s ease-in-out",
            overflowX: "hidden",
            top: { xs: "33px", md: "44px" },
            height: { xs: "calc(100vh - 33px)", md: "calc(100vh - 44px)" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              px: 1.5,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 56,
            }}
          >
            <IconButton
              onClick={toggleDropdown}
              sx={{
                p: 0.5,
                "&:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              <Image
                src="/logoHorizontal.png"
                alt="amond"
                width={73}
                height={18}
                style={{ objectFit: "contain" }}
              />
            </IconButton>
          </Box>

          <Divider />

          {/* New Brand Button */}
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleNewProject}
              color="inherit"
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                backgroundColor: "transparent",
                color: "#000",
                borderColor: "#000",
                borderWidth: 1,
                fontWeight: 500,
                fontSize: 9,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  borderColor: "#000",
                  borderWidth: 1,
                  color: "#000",
                },
                px: 1.5,
                py: 0.5,
                minHeight: 30,
              }}
            >
              새 브랜드 만들기
            </Button>
          </Box>

          {/* Brands and Feed Sets List */}
          <Box sx={{ flexGrow: 1, overflow: "auto", position: "relative" }}>
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : brands.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
                  브랜드를 생성하세요
                </Typography>
              </Box>
            ) : (
              <List sx={{ pt: 0 }}>
                {brands.map((brand) => (
                  <Box key={brand.brandId}>
                    {/* Brand Header */}
                    <ListItem
                      disablePadding
                      sx={{
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor: "#FFF8E1",
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <ListItemButton
                          onClick={() => toggleBrand(brand.brandId)}
                          sx={{
                            px: 2,
                            py: 0.5,
                            minHeight: 24,
                            flex: 1,
                          }}
                        >
                          <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                            {expandedBrands[brand.brandId] ? (
                              <ChevronDownIcon sx={{ fontSize: 16, color: "#666" }} />
                            ) : (
                              <ChevronRightIcon sx={{ fontSize: 16, color: "#666" }} />
                            )}
                          </Box>
                          <Box sx={{ mr: 0.75 }}>
                            <FolderIcon sx={{ fontSize: 14, color: "#666" }} />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontSize: 7.5,
                              color: "#202123",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              flex: 1,
                            }}
                          >
                            {brand.name}
                          </Typography>
                        </ListItemButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: 7,
                              color: "#999",
                              mr: 0.5,
                              minWidth: 14,
                              textAlign: 'center',
                            }}
                          >
                            {feedSets[brand.brandId]?.length || 0}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBrandMenuAnchor({ ...brandMenuAnchor, [brand.brandId]: e.currentTarget });
                            }}
                            sx={{ p: 0.25, width: 20, height: 20 }}
                          >
                            <MoreVertIcon sx={{ fontSize: 14, color: "#999" }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    
                    {/* Feed Sets */}
                    {expandedBrands[brand.brandId] && (
                      <List sx={{ pl: 3 }}>
                        {feedSets[brand.brandId] ? (
                          feedSets[brand.brandId].map((feedSet) => (
                          <ListItem
                            key={feedSet.projectId}
                            disablePadding
                            sx={{
                              backgroundColor: (() => {
                                const currentCr = router.query.cr;
                                // For feedsets with content request IDs
                                if (feedSet.projectId.includes('_cr')) {
                                  const [baseProjectId, crId] = feedSet.projectId.split('_cr');
                                  return baseProjectId === currentProjectId && (!currentCr || currentCr === crId) ? "#FFDBB9" : "transparent";
                                }
                                // For regular feedsets
                                return feedSet.projectId === currentProjectId && !currentCr ? "#FFDBB9" : "transparent";
                              })(),
                              "&:hover": {
                                backgroundColor: (() => {
                                  const currentCr = router.query.cr;
                                  if (feedSet.projectId.includes('_cr')) {
                                    const [baseProjectId, crId] = feedSet.projectId.split('_cr');
                                    return baseProjectId === currentProjectId && (!currentCr || currentCr === crId) ? "#FFDBB9" : "#FFF8E1";
                                  }
                                  return feedSet.projectId === currentProjectId && !currentCr ? "#FFDBB9" : "#FFF8E1";
                                })(),
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <ListItemButton
                                onClick={() => handleSelectProject(feedSet.projectId)}
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  minHeight: 24,
                                  flex: 1,
                                }}
                              >
                                <Box sx={{ mr: 1 }}>
                                  <DescriptionIcon
                                    sx={{
                                      fontSize: 14,
                                      color: (() => {
                                        const currentCr = router.query.cr;
                                        if (feedSet.projectId.includes('_cr')) {
                                          const [baseProjectId, crId] = feedSet.projectId.split('_cr');
                                          return baseProjectId === currentProjectId && (!currentCr || currentCr === crId) ? "#000" : "#999";
                                        }
                                        return feedSet.projectId === currentProjectId && !currentCr ? "#000" : "#999";
                                      })(),
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: (() => {
                                      const currentCr = router.query.cr;
                                      if (feedSet.projectId.includes('_cr')) {
                                        const [baseProjectId, crId] = feedSet.projectId.split('_cr');
                                        return baseProjectId === currentProjectId && (!currentCr || currentCr === crId) ? 600 : 400;
                                      }
                                      return feedSet.projectId === currentProjectId && !currentCr ? 600 : 400;
                                    })(),
                                    fontSize: 7.5,
                                    color: (() => {
                                      const currentCr = router.query.cr;
                                      if (feedSet.projectId.includes('_cr')) {
                                        const [baseProjectId, crId] = feedSet.projectId.split('_cr');
                                        return baseProjectId === currentProjectId && (!currentCr || currentCr === crId) ? "#000" : "#666";
                                      }
                                      return feedSet.projectId === currentProjectId && !currentCr ? "#000" : "#666";
                                    })(),
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {moment(feedSet.createdAt).format('YYYY년 MM월 DD일 생성')}
                                </Typography>
                              </ListItemButton>
                              <Box sx={{ pr: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFeedMenuAnchor({ ...feedMenuAnchor, [feedSet.projectId]: e.currentTarget });
                                  }}
                                  sx={{ p: 0.25, width: 20, height: 20 }}
                                >
                                  <MoreVertIcon sx={{ fontSize: 12, color: "#999" }} />
                                </IconButton>
                              </Box>
                            </Box>
                          </ListItem>
                          ))
                        ) : null}
                        
                        {/* Add new feed set button */}
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleNewFeedSet(brand.brandId)}
                            sx={{
                              px: 2,
                              py: 0.5,
                              minHeight: 24,
                              "&:hover": {
                                backgroundColor: "#FFF8E1",
                              },
                            }}
                          >
                            <Box sx={{ mr: 1 }}>
                              <AddIcon sx={{ fontSize: 14, color: "#999" }} />
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 7.5,
                                color: "#666",
                                fontWeight: 400,
                              }}
                            >
                              새 feed set 생성
                            </Typography>
                          </ListItemButton>
                        </ListItem>
                        {/* Feed Menu */}
                        {feedSets[brand.brandId] && feedSets[brand.brandId].map((feedSet) => (
                          <Menu
                            key={feedSet.projectId}
                            anchorEl={feedMenuAnchor[feedSet.projectId]}
                            open={Boolean(feedMenuAnchor[feedSet.projectId])}
                            onClose={() => setFeedMenuAnchor({ ...feedMenuAnchor, [feedSet.projectId]: null })}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            disablePortal={false}
                            disableScrollLock={true}
                            sx={{
                              zIndex: 1400,
                              '& .MuiPaper-root': {
                                minWidth: 120,
                                boxShadow: 2,
                                position: 'fixed',
                              }
                            }}
                          >
                            <MenuItem 
                              onClick={() => {
                                setFeedMenuAnchor({ ...feedMenuAnchor, [feedSet.projectId]: null });
                                const feedSetCount = feedSets[brand.brandId]?.length || 0;
                                const isLastFeedSet = feedSetCount === 1;
                                const confirmMessage = isLastFeedSet 
                                  ? `이 피드셋을 삭제하시겠습니까?\n\n"${moment(feedSet.createdAt).format('YYYY년 MM월 DD일')} 생성"\n\n⚠️ 경고: 이것은 "${brand.name}" 브랜드의 마지막 피드셋입니다.\n피드셋 삭제 시 브랜드도 함께 삭제됩니다.`
                                  : `이 피드셋을 삭제하시겠습니까?\n\n"${moment(feedSet.createdAt).format('YYYY년 MM월 DD일')} 생성"`;
                                
                                if (confirm(confirmMessage)) {
                                  handleDeleteFeedSet(feedSet.projectId);
                                }
                              }}
                              sx={{ fontSize: 8, py: 0.5, color: 'error.main' }}
                            >
                              <DeleteIcon sx={{ fontSize: 14, mr: 1 }} />
                              피드셋 삭제
                            </MenuItem>
                          </Menu>
                        ))}
                      </List>
                    )}
                    
                    {/* Brand Menu */}
                    <Menu
                      anchorEl={brandMenuAnchor[brand.brandId]}
                      open={Boolean(brandMenuAnchor[brand.brandId])}
                      onClose={() => setBrandMenuAnchor({ ...brandMenuAnchor, [brand.brandId]: null })}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      disablePortal={false}
                      disableScrollLock={true}
                      sx={{
                        zIndex: 1400,
                        '& .MuiPaper-root': {
                          minWidth: 120,
                          boxShadow: 2,
                          position: 'fixed',
                        }
                      }}
                    >
                    <MenuItem 
                      onClick={() => {
                        setBrandMenuAnchor({ ...brandMenuAnchor, [brand.brandId]: null });
                        // TODO: Implement brand edit
                        alert('브랜드 수정 기능은 준비 중입니다.');
                      }}
                      sx={{ fontSize: 8, py: 0.5 }}
                    >
                      <EditIcon sx={{ fontSize: 14, mr: 1 }} />
                      브랜드 수정
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        setBrandMenuAnchor({ ...brandMenuAnchor, [brand.brandId]: null });
                        if (confirm(`"${brand.name}" 브랜드를 삭제하시겠습니까?\n\n경고: 이 브랜드의 모든 피드셋이 함께 삭제됩니다.`)) {
                          handleDeleteBrand(brand.brandId);
                        }
                      }}
                      sx={{ fontSize: 8, py: 0.5, color: 'error.main' }}
                    >
                      <DeleteIcon sx={{ fontSize: 14, mr: 1 }} />
                      브랜드 삭제
                    </MenuItem>
                  </Menu>
                  </Box>
                ))}
              </List>
            )}
          </Box>

        </Box>
      </Drawer>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <Fade in={dropdownOpen} timeout={300}>
          <Box
            sx={{
              position: "fixed",
              top: { xs: 100, md: 110 },
              left: 30,
              width: 210,
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: 3,
              p: 2.25,
              zIndex: 1300,
              transition: "all 0.3s ease-in-out",
            }}
          >
            {/* User Info */}
            {userInfo && (
              <>
                {console.log("Dropdown userInfo:", userInfo, "fullUserInfo:", fullUserInfo)}
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      bgcolor: "#FFA726",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                    }}
                  >
                    <Typography fontSize={24} color="#fff">
                      👤
                    </Typography>
                  </Box>
                  <Box>
                    <Typography fontWeight={700} fontSize={13.5}>
                      {fullUserInfo?.name || userInfo.name || userInfo.authType || "회원"}
                    </Typography>
                    <Typography color="grey.600" fontSize={10.5}>
                      {fullUserInfo?.email || userInfo.email || `@user_${userInfo.id}`}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5 }} />
              </>
            )}

            {/* Menu Items */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {userInfo && (
                <Button
                  variant="text"
                  sx={{
                    justifyContent: "flex-start",
                    color: "#333",
                    fontWeight: 600,
                    fontSize: 10.5,
                    textTransform: "none",
                    "&:hover": { backgroundColor: "#FFF8E1" },
                  }}
                  onClick={() => {
                    router.push("/profile");
                    setDropdownOpen(false);
                  }}
                >
                  프로필
                </Button>
              )}
              <Button
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  color: "#333",
                  fontSize: 10.5,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#FFF8E1" },
                }}
                onClick={() => {
                  router.push("/subscribe");
                  setDropdownOpen(false);
                }}
              >
                구독 결제하기
              </Button>
              <Button
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  color: "#333",
                  fontSize: 10.5,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#FFF8E1" },
                }}
                onClick={() => window.open("https://sticky-partridge-ee9.notion.site/2172fde8bab680b1b776cb4244d60f9b", "_blank")}
              >
                이용약관
              </Button>
              <Button
                variant="text"
                sx={{
                  justifyContent: "flex-start",
                  color: "#333",
                  fontSize: 10.5,
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#FFF8E1" },
                }}
                onClick={() => window.open("https://sticky-partridge-ee9.notion.site/2172fde8bab68036bd25f88124abaf02", "_blank")}
              >
                개인정보처리방침
              </Button>
            </Box>

            {userInfo ? (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    fontSize: 10.5,
                    textTransform: "none",
                    py: 0.75,
                  }}
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Button
                  variant="contained"
                  color="warning"
                  fullWidth
                  sx={{
                    fontWeight: 700,
                    fontSize: 10.5,
                    textTransform: "none",
                    py: 0.75,
                  }}
                  onClick={() => {
                    router.push("/login");
                    setDropdownOpen(false);
                  }}
                >
                  로그인하기
                </Button>
              </>
            )}
          </Box>
        </Fade>
      )}

      {/* Click outside to close */}
      {dropdownOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1299,
          }}
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Feed Set Creation Modal */}
      <Dialog 
        open={feedSetModalOpen} 
        onClose={() => {
          setFeedSetModalOpen(false);
          setSelectedImageIndex(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 600 }}>
          새 Feed Set 생성 - {selectedBrandForFeedSet?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: 12, mb: 1, color: 'text.secondary' }}>
              각 이미지를 클릭하여 설정을 변경하세요
            </Typography>
          </Box>
          
          {/* 2x2 Grid Preview */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 2,
              mb: 3,
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            {[0, 1, 2, 3].map((index) => {
              const config = imageConfigs[index];
              const isConfigured = config && (config.contentType !== '방향성 없음' || config.snsEvent || config.additionalText);
              const isSelected = selectedImageIndex === index;
              
              return (
                <Box
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    aspectRatio: '1/1',
                    bgcolor: isSelected ? 'primary.light' : isConfigured ? 'grey.100' : 'grey.50',
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : isConfigured ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {/* Image Number */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    이미지 {index + 1}
                  </Typography>
                  
                  {/* Configuration Status */}
                  {isConfigured && (
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 500, mb: 0.5 }}>
                        {config.contentType}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        {config.imageSize}
                      </Typography>
                      {config.snsEvent && (
                        <Chip label="SNS 이벤트" size="small" sx={{ fontSize: 9, height: 16, mt: 0.5 }} />
                      )}
                    </Box>
                  )}
                  
                  {/* Click to Configure */}
                  {!isConfigured && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      클릭하여 설정
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Configuration Panel for Selected Image */}
          {selectedImageIndex !== null && (
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
                이미지 {selectedImageIndex + 1} 설정
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* Content Type Selection */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: 12 }}>콘텐츠 타입</InputLabel>
                    <Select
                      value={imageConfigs[selectedImageIndex]?.contentType || ''}
                      onChange={(e) => {
                        const newConfigs = [...imageConfigs];
                        newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], contentType: e.target.value };
                        setImageConfigs(newConfigs);
                      }}
                      label="콘텐츠 타입"
                      sx={{ fontSize: 12 }}
                    >
                      <MenuItem value="방향성 없음" sx={{ fontSize: 12 }}>방향성 없음</MenuItem>
                      <Divider />
                      {(CONTENT_TYPES[selectedBrandForFeedSet?.category as keyof typeof CONTENT_TYPES] || CONTENT_TYPES['기타']).map((type) => (
                        <MenuItem key={type} value={type} sx={{ fontSize: 12 }}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {/* Image Size Selection */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: 12 }}>이미지 사이즈</InputLabel>
                    <Select
                      value={imageConfigs[selectedImageIndex]?.imageSize || '1:1'}
                      onChange={(e) => {
                        const newConfigs = [...imageConfigs];
                        newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], imageSize: e.target.value };
                        setImageConfigs(newConfigs);
                      }}
                      label="이미지 사이즈"
                      sx={{ fontSize: 12 }}
                    >
                      <MenuItem value="1:1" sx={{ fontSize: 12 }}>1:1 (정사각형)</MenuItem>
                      <MenuItem value="2:3" sx={{ fontSize: 12 }}>2:3 (세로형)</MenuItem>
                      <MenuItem value="3:2" sx={{ fontSize: 12 }}>3:2 (가로형)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* SNS Event Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={imageConfigs[selectedImageIndex]?.snsEvent || false}
                    onChange={(e) => {
                      const newConfigs = [...imageConfigs];
                      newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], snsEvent: e.target.checked };
                      setImageConfigs(newConfigs);
                    }}
                  />
                }
                label="SNS 이벤트"
                sx={{ 
                  '& .MuiFormControlLabel-label': { fontSize: 12 },
                  mb: 2,
                  ml: 0
                }}
              />
              
              {/* Additional Text */}
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="개별 요청사항"
                value={imageConfigs[selectedImageIndex]?.additionalText || ''}
                onChange={(e) => {
                  const newConfigs = [...imageConfigs];
                  newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], additionalText: e.target.value };
                  setImageConfigs(newConfigs);
                }}
                sx={{ 
                  '& .MuiInputBase-root': { fontSize: 12 },
                  '& .MuiInputBase-input': { fontSize: 12 }
                }}
              />
            </Box>
          )}
          
          {/* General Additional Instructions */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="전체 추가 요청사항 (선택)"
            placeholder="4개 이미지 전체에 적용할 요청사항을 입력해주세요."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            sx={{
              '& .MuiInputBase-root': { fontSize: 12 },
              '& .MuiInputLabel-root': { fontSize: 12 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setFeedSetModalOpen(false);
              setSelectedImageIndex(null);
            }}
            sx={{ fontSize: 12 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleCreateFeedSet}
            variant="contained"
            color="primary"
            sx={{ fontSize: 12 }}
          >
            생성하기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading backdrop while creating feedset */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={isCreatingFeedSet}
      >
        <CircularProgress color="inherit" />
        <Typography variant="h6">
          새 피드셋 생성 중...
        </Typography>
      </Backdrop>
    </>
  );
}