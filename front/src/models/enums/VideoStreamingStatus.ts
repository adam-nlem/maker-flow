export enum VideoStreamingStatus {
    Pending = 'pending',
    Processing = 'processing',
    Ready = 'ready',
    Failed = 'failed',
}

export const videoStreamingStatusOptions = Object.values(VideoStreamingStatus);
