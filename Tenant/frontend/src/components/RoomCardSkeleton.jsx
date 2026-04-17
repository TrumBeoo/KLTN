import { Box, Card, Stack, Skeleton } from '@mui/material'

export default function RoomCardSkeleton() {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2}>
        <Skeleton 
          variant="rectangular" 
          width={300} 
          height={222} 
          sx={{ borderRadius: 1, flexShrink: 0 }} 
          animation="wave"
        />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Skeleton variant="text" width={80} height={24} />
            <Skeleton variant="text" width={100} height={24} />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="circular" width={24} height={24} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
          </Stack>
        </Box>
      </Stack>
    </Card>
  )
}
