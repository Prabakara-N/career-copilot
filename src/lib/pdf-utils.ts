/**
 * Convert a base64 PDF string to a Blob.
 * Use this to download or open in a new tab.
 */
export function base64ToPdfBlob(base64: string): Blob {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadBase64Pdf(filename: string, base64: string): void {
  const blob = base64ToPdfBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open a PDF in a new browser tab using the native viewer.
 * Uses an anchor click (like a user-initiated link) so Chrome/Edge render
 * inline instead of force-downloading — which happens when opening a blob
 * URL programmatically via window.open() with "noopener".
 *
 * Intentionally NO `download` attribute — that would force a save-as dialog.
 */
export function previewBase64Pdf(base64: string): void {
  const blob = base64ToPdfBlob(base64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a delay so the new tab has time to load
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
