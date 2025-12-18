import { API_BASE_URL } from '@/config'
import { generateUUID } from '@/lib'
import request from '@/lib/request'
import {
  ABORT_REASONS,
  ProgressVariant,
  UploadProgressUI,
  UploadStatus,
  UploadStore,
  useGetGroupById,
  useStoreUploaderActions,
} from '@/store/useUploadStoreResume'
import axios from 'axios'
import { useCallback } from 'react'
import { useMediaMetadata } from './useMediaMetadata'

const CHUNK_SIZE = 3 * 1024 * 1024 // 3MB
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 4000 // 4 second delay between retries
type IUploadFile = {
  groupId: string
  fileId: string
  file: File
  controller: AbortController
  startChunkIndex?: number
  startTime?: number
}
export const useFileUploadResume = () => {
  const getMediaMetaData = useMediaMetadata()
  const {
    onAddFile,
    onUpdateFile,
    onAddGroup,
    onUpdateProgress,
    onMarkFileFailed,
    onCancelFile,
    onCancelGroup,
    onUpdateGroup,
    onRemoveFile,
    onResumeByFileIdGroupId,
    onPauseByFileIdGroupId,
  } = useStoreUploaderActions()
  const getGroup = useGetGroupById()

  const uploadFile = useCallback(
    async (props: IUploadFile) => {
      const {
        groupId,
        fileId,
        file,
        controller,
        startChunkIndex = 0,
        startTime = Date.now(),
      } = props
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      // const uploadId = generateUUID();
      // const startTime = Date.now();
      let res

      for (
        let chunkIndex = startChunkIndex;
        chunkIndex < totalChunks;
        chunkIndex++
      ) {
        const start = chunkIndex * CHUNK_SIZE
        const end = Math.min(file.size, start + CHUNK_SIZE)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('chunkIndex', chunkIndex.toString())
        formData.append('totalChunks', totalChunks.toString())
        formData.append('uploadId', fileId)
        formData.append('fileName', file.name)
        formData.append('fileType', file.type)
        formData.append('fileSize', file.size.toString())
        formData.append(
          'lastChunk',
          (chunkIndex === totalChunks - 1).toString(),
        )
        formData.append('chunk', chunk, `${file.name}.part${chunkIndex}`)
        try {
          res = await request(`media/chunk`, {
            data: formData,
            method: 'POST',
            signal: controller.signal,
            onUploadProgress: (e) => {
              const elapsed = (Date.now() - startTime) / 1000
              const chunkProgress = e.loaded / chunk.size
              let progress = ((chunkIndex + chunkProgress) / totalChunks) * 100
              // Minus one for server response delay
              progress = Math.min(Math.round(progress), 99.9) // Prevent overflow
              // const progress =
              //   ((chunkIndex + e.loaded / chunk.size) / totalChunks) * 100;
              const loaded = Math.min(e.loaded, file.size)
              onUpdateProgress({
                groupId,
                fileId,
                progress,
                elapsedTime: elapsed,
                uploadedBytes: loaded,
              })
            },
          })

          console.log(res, 'Chunk upload response')
          if (res?.status !== 200 || !res?.data) {
            onMarkFileFailed(groupId, fileId, 'Upload failed')
            return
          }
          // uploadedSize += chunk.size;
          const progress = ((chunkIndex + 1) / totalChunks) * 100
          const elapsedTime = (Date.now() - startTime) / 1000
          const data = res.data?.data
          // console.log({ data, progress, fileId });
          onUpdateProgress({
            groupId,
            fileId,
            progress,
            elapsedTime,
            uploadedChunkIndex: chunkIndex + 1,
            data: data?.metadata,
          })

          break
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          const newChunkIndex = chunkIndex > 0 ? chunkIndex - 1 : 0
          const progress = (newChunkIndex / totalChunks) * 100

          console.warn('Upload cancelled', file.name)
          if (err.reason === ABORT_REASONS.PAUSED) {
            console.warn('Upload aborted', file.name)
            onUpdateFile(groupId, {
              id: fileId,
              status: UploadStatus.PAUSED,
              controller: undefined,
              progress,
            })
            return
          }
          console.error('Upload failed after retries', file.name, err)
          onUpdateFile(groupId, {
            id: fileId,
            progress,
            elapsedTime: (Date.now() - startTime) / 1000,
          })
          const errorMessage =
            err?.data?.message || err?.message || 'Upload failed'
          onMarkFileFailed(groupId, fileId, errorMessage)
          return
        }
      }

      // Final update
      const data = res?.data?.data
      if (data?.metadata) {
        const elapsed = (Date.now() - startTime) / 1000
        console.log(elapsed, 'Elapsed time for upload')
        onUpdateProgress({
          groupId,
          fileId,
          progress: 100,
          elapsedTime: elapsed,
        })
      }
    },
    [onMarkFileFailed, onUpdateFile, onUpdateProgress],
  )

  const uploadFiles = useCallback(
    (
      groupId: string,
      groupName: string,
      files: File[],
      progressVariant: ProgressVariant = UploadProgressUI.CARD,
    ) => {
      onAddGroup({ groupId, groupName, progressVariant })

      files.forEach((file) => {
        const fileId = generateUUID()
        const controller = new AbortController()

        onAddFile(groupId, {
          fileId,
          fileName: file.name,
          fileSize: file.size,
          controller,

          file,
        })

        uploadFile({
          groupId,
          fileId,
          file,
          controller,
          startTime: Date.now(),
        })
      })
    },
    [onAddFile, onAddGroup, uploadFile],
  )

  const uploadByGroupId = useCallback(
    (
      groupId: string,
      onUploadFinish: (
        group: ReturnType<typeof getGroup>,
        state?: UploadStore,
        groupIndex?: number,
      ) => void,
    ) => {
      const group = getGroup(groupId)
      if (!group || group.files.length === 0) {
        return onUploadFinish(group)
      }

      onUpdateGroup(groupId, {
        status: UploadStatus.UPLOADING,
        onUploadFinish,
      })

      group.files.forEach((file) => {
        if (file.status === 'ready') {
          onUpdateFile(groupId, {
            id: file.id,
            status: UploadStatus.UPLOADING,
            startTime: Date.now(),
          })

          uploadFile({
            groupId,
            fileId: file.id,
            file: file.file!,
            controller: file.controller!,
          })
        }
      })
    },
    [onUpdateGroup, onUpdateFile, uploadFile, getGroup],
  )

  const createAndAddFilesToGroup = useCallback(
    async (
      groupId: string,
      groupName: string,
      files: File[],
      createThumb: boolean,
      progressVariant: ProgressVariant = UploadProgressUI.CARD,
    ) => {
      onAddGroup({ groupId, groupName, progressVariant })
      files.map(async (file) => {
        const fileId = generateUUID()
        const controller = new AbortController()
        let previewUrl

        if (createThumb) {
          try {
            const resp = await getMediaMetaData.extract(file)
            previewUrl = resp.thumbnail
          } catch (err) {
            console.error('Failed to extract metadata for', file.name, err)
            // Optionally add failed file with status: "failed"
          }
        }
        onAddFile(groupId, {
          fileId,
          fileName: file.name,
          fileSize: file.size,
          controller,
          file,
          status: UploadStatus.READY,
          previewUrl,
        })
      })
    },
    [onAddGroup, onAddFile],
  )

  const resumeByFileIdGroupId = useCallback(
    async (groupId: string, fileId: string) => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/media/status?uploadId=${fileId}`,
        )
        onResumeByFileIdGroupId(groupId, fileId, (_group, file) => {
          if (!file) return

          uploadFile({
            groupId,
            fileId,
            file: file.file!,
            controller: file.controller!,
            startChunkIndex:
              res.data?.data?.uploadedChunks?.length ||
              file.uploadedChunkIndex ||
              0,
          })
        })
      } catch (error) {
        console.error('Error resuming file upload:', error)
        return
      }
    },
    [onResumeByFileIdGroupId, uploadFile],
  )
  const pauseByFileIdGroupId = useCallback(
    (groupId: string, fileId: string) => {
      onPauseByFileIdGroupId(groupId, fileId, (_group, file) => {
        console.log('Pause File: ', { id: file.id })
      })
    },
    [onPauseByFileIdGroupId],
  )
  const addMoreFilesToGroup = useCallback(
    (groupId: string, files: File[]) => {
      const group = getGroup(groupId)
      if (!group) return
      files.map(async (file) => {
        const fileId = generateUUID()
        const controller = new AbortController()
        let previewUrl
        const progressVariant = group.progressVariant
        const createthumb =
          progressVariant === UploadProgressUI.CARD ||
          progressVariant === UploadProgressUI.ROW ||
          progressVariant === UploadProgressUI.CARDFLAT
        if (createthumb) {
          try {
            const resp = await getMediaMetaData.extract(file)
            previewUrl = resp.thumbnail
          } catch (err) {
            console.error('Failed to extract metadata for', file.name, err)
            // Optionally add failed file with status: "failed"
          }
        }
        onAddFile(groupId, {
          fileId,
          fileName: file.name,
          fileSize: file.size,
          controller,
          file,
          status: UploadStatus.READY,
          previewUrl,
        })
      })
    },
    [onAddFile, getGroup],
  )
  const removeFileByGroupIdFileId = useCallback(
    (groupId: string, fileId: string) => {
      const group = getGroup(groupId)
      if (!group) return
      const file = group.files.find((f) => f.id === fileId)
      if (!file) return
      if (file.status === UploadStatus.UPLOADING && file.controller) {
        file.controller.abort(ABORT_REASONS.CANCELLED)
      }
      onRemoveFile(groupId, fileId)
    },
    [onRemoveFile, getGroup],
  )
  const toggleFilePause = useCallback(
    (groupId: string, fileId: string, isPaused: boolean) => {
      if (isPaused) {
        resumeByFileIdGroupId(groupId, fileId)
      } else {
        pauseByFileIdGroupId(groupId, fileId)
      }
    },
    [resumeByFileIdGroupId, pauseByFileIdGroupId],
  )
  const cancelAndRemoveFileByGroupIdFileId = useCallback(
    (groupId: string, fileId: string) => {
      const group = getGroup(groupId)
      if (!group) return
      const file = group.files.find((f) => f.id === fileId)
      if (!file) return
      if (file.status === UploadStatus.UPLOADING && file.controller) {
        file.controller.abort(ABORT_REASONS.CANCELLED)
      }
      onRemoveFile(groupId, fileId)
    },
    [onRemoveFile, getGroup],
  )
  return {
    uploadFiles,
    onCancelFile,
    onCancelGroup,
    uploadByGroupId,
    createAndAddFilesToGroup,
    removeFileByGroupIdFileId,
    resumeByFileIdGroupId,
    pauseByFileIdGroupId,
    addMoreFilesToGroup,
    toggleFilePause,
    cancelAndRemoveFileByGroupIdFileId,
  }
}
