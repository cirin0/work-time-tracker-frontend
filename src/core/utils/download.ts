import type { AxiosResponse } from 'axios'

/**
 * Parses the Content-Disposition header and triggers a file download in the browser.
 */
export function downloadBlob(response: AxiosResponse, defaultFilename: string) {
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url

  // Try to get filename from Content-Disposition header
  const contentDisposition = response.headers['content-disposition']
  let filename = defaultFilename

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/)
    if (filenameMatch && filenameMatch.length === 2) {
      filename = filenameMatch[1]
    }
  }

  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()

  // Clean up
  link.remove()
  window.URL.revokeObjectURL(url)
}
