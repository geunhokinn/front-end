import { AxiosResponse } from 'axios'
import API from './API'
import { FileResponse, GetFileResponse } from '@/models/FileSystemEntryData'

/** 파일 조회 API */
export async function getFile(
  containerId: string | number,
  fileId: string | number
): Promise<GetFileResponse> {
  try {
    const response: AxiosResponse = await API.get(
      `/api/workspaces/${containerId}/files/${fileId}`
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (err: any) {
    return {
      success: false,
      error:
        err.response?.data?.message || err.message || 'Unknown error occurred',
    }
  }
}

/** 파일 저장(수정) API */
export async function saveFile(
  containerId: string | number,
  fileId: string | number,
  content: string
): Promise<FileResponse> {
  try {
    const response: AxiosResponse = await API.put(
      `/api/workspaces/${containerId}/files/${fileId}`,
      content
    )

    return {
      success: true,
      data: response.data,
    }
  } catch (err: any) {
    return {
      success: false,
      error:
        err.response?.data?.message || err.message || 'Unknown error occurred',
    }
  }
}
