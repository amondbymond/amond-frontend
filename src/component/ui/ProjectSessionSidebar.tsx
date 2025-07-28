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
} from "@mui/material";
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { apiCall, handleAPIError } from "@/module/utils/api";
import moment from "moment";

interface ProjectSession {
  projectId: string;
  name: string;
  sessionName: string;
  category: string;
  url: string;
  createdAt: string;
  lastAccessedAt: string;
  isActive: boolean;
}

interface ProjectSessionSidebarProps {
  currentProjectId?: string;
}

const drawerWidth = 280;

export default function ProjectSessionSidebar({
  currentProjectId,
}: ProjectSessionSidebarProps) {
  const router = useRouter();
  const { userInfo } = useContext(LoginContext);
  const [sessions, setSessions] = useState<ProjectSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (userInfo) {
      loadSessions();
    }
  }, [userInfo]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall({
        url: "/content/project/sessions",
        method: "get",
      });
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    router.push("/");
  };

  const handleSelectProject = (projectId: string) => {
    if (projectId !== currentProjectId) {
      router.push(`/project/${projectId}`);
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

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isOpen ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isOpen ? drawerWidth : 60,
            boxSizing: "border-box",
            backgroundColor: "#f7f7f8",
            borderRight: "1px solid #e5e5e7",
            transition: "width 0.2s ease-in-out",
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 64,
            }}
          >
            {isOpen && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#202123",
                  fontSize: 18,
                }}
              >
                프로젝트
              </Typography>
            )}
            <IconButton
              onClick={toggleDrawer}
              size="small"
              sx={{
                ml: isOpen ? 0 : "auto",
                mr: isOpen ? 0 : "auto",
              }}
            >
              {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>

          <Divider />

          {/* New Project Button */}
          <Box sx={{ p: isOpen ? 2 : 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={isOpen ? <AddIcon /> : null}
              onClick={handleNewProject}
              sx={{
                justifyContent: isOpen ? "flex-start" : "center",
                textTransform: "none",
                borderColor: "#e5e5e7",
                color: "#202123",
                "&:hover": {
                  backgroundColor: "#ececf1",
                  borderColor: "#d9d9e3",
                },
                minWidth: isOpen ? "auto" : 40,
                px: isOpen ? 2 : 0,
              }}
            >
              {isOpen ? "새 프로젝트" : <AddIcon />}
            </Button>
          </Box>

          {/* Sessions List */}
          <Box sx={{ flexGrow: 1, overflow: "auto" }}>
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
            ) : (
              <List sx={{ pt: 0 }}>
                {sessions.map((session) => (
                  <ListItem
                    key={session.projectId}
                    disablePadding
                    sx={{
                      backgroundColor:
                        session.projectId === currentProjectId
                          ? "#ececf1"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() => handleSelectProject(session.projectId)}
                      sx={{
                        px: isOpen ? 2 : 1,
                        py: 1.5,
                        minHeight: 48,
                      }}
                    >
                      {!isOpen ? (
                        <Tooltip title={session.sessionName} placement="right">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: 14,
                              backgroundColor:
                                session.projectId === currentProjectId
                                  ? "#10a37f"
                                  : "#e5e5e7",
                              color:
                                session.projectId === currentProjectId
                                  ? "white"
                                  : "#666",
                            }}
                          >
                            {session.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      ) : (
                        <>
                          <Box sx={{ mr: 2 }}>
                            <FolderIcon
                              sx={{
                                fontSize: 20,
                                color:
                                  session.projectId === currentProjectId
                                    ? "#10a37f"
                                    : "#666",
                              }}
                            />
                          </Box>
                          <ListItemText
                            primary={
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    session.projectId === currentProjectId
                                      ? 600
                                      : 400,
                                  fontSize: 14,
                                  color: "#202123",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {session.sessionName}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#666",
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <HistoryIcon sx={{ fontSize: 12 }} />
                                {formatDate(session.lastAccessedAt)}
                              </Typography>
                            }
                          />
                        </>
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* User Info */}
          {userInfo && isOpen && (
            <>
              <Divider />
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: "#666",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  로그인 계정
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#202123",
                    fontWeight: 500,
                  }}
                >
                  @user_{userInfo.id}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}