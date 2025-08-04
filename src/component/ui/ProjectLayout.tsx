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