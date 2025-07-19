import { Box, BoxProps } from "@mui/material";

export default function CustomSvgIcon({
  src,
  color,
  sx,
  ...props
}: {
  src: string;
  color: string;
  sx: any;
} & BoxProps) {
  return (
    <Box
      {...props}
      sx={{
        WebkitMask: `url(${src}) no-repeat center / contain`,
        mask: `url(${src}) no-repeat center / contain`,
        backgroundColor: color,
        ...sx,
      }}
    />
  );
}
