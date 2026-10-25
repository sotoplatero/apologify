// Share an apology's 9:16 story image. On phones that support sharing files
// (iOS/Android) this opens the native sheet straight to Instagram/WhatsApp;
// elsewhere it downloads the PNG so it can be posted by hand.
export async function shareStoryImage(slug: string, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const res = await fetch(`/story/${slug}.png`);
  const blob = await res.blob();
  const file = new File([blob], `apology-${slug}.png`, { type: 'image/png' });

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text });
      return 'shared';
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return 'cancelled';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}
