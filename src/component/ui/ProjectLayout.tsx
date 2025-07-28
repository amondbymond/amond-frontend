import React, { ReactNode } from "react";
import { Box, AppBar, Toolbar, IconButton } from "@mui/material";
import ProjectSessionSidebar from "./ProjectSessionSidebar";
import Image from "next/image";
import { useRouter } from "next/router";

interface ProjectLayoutProps {
  children: ReactNode;
  currentProjectId?: string;
}

export default function ProjectLayout({
  children,
  currentProjectId,
}: ProjectLayoutProps) {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#fff" }}>
      <ProjectSessionSidebar currentProjectId={currentProjectId} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Navbar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: "#fff",
            borderBottom: "1px solid #e5e5e7",
          }}
        >
          <Toolbar
            sx={{
              minHeight: 64,
              px: { xs: 2, md: 4 },
            }}
          >
            <IconButton
              edge="start"
              onClick={() => router.push("/")}
              sx={{ p: 0.5, mr: 2 }}
            >
              <Image
                src="/logoHorizontal.png"
                alt="amond"
                width={100}
                height={28}
                style={{ objectFit: "contain" }}
              />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            backgroundColor: "#fff",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}