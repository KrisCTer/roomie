const ATTACHMENT_PREFIX = "__ROOMIE_ATTACHMENT__:";

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const createAttachmentMessage = ({ text = "", attachments = [] }) => {
  const normalizedText = (text || "").trim();
  const normalizedAttachments = (attachments || []).filter(
    (item) => item?.url && item?.name
  );

  if (normalizedAttachments.length === 0) {
    return normalizedText;
  }

  return `${ATTACHMENT_PREFIX}${JSON.stringify({
    text: normalizedText,
    attachments: normalizedAttachments,
  })}`;
};

export const parseAttachmentMessage = (rawMessage) => {
  const source = rawMessage || "";

  if (!source.startsWith(ATTACHMENT_PREFIX)) {
    return {
      isAttachmentMessage: false,
      text: source,
      attachments: [],
    };
  }

  const payload = safeJsonParse(source.slice(ATTACHMENT_PREFIX.length));
  if (!payload || !Array.isArray(payload.attachments)) {
    return {
      isAttachmentMessage: false,
      text: source,
      attachments: [],
    };
  }

  return {
    isAttachmentMessage: true,
    text: payload.text || "",
    attachments: payload.attachments,
  };
};

export const getAttachmentPreviewText = (rawMessage) => {
  const parsed = parseAttachmentMessage(rawMessage);

  if (!parsed.isAttachmentMessage) {
    return parsed.text || "No messages yet";
  }

  const imageCount = parsed.attachments.filter((item) => item?.isImage).length;
  const fileCount = parsed.attachments.length - imageCount;

  const chunks = [];
  if (imageCount > 0) {
    chunks.push(imageCount === 1 ? "1 ảnh" : `${imageCount} ảnh`);
  }
  if (fileCount > 0) {
    chunks.push(fileCount === 1 ? "1 tệp" : `${fileCount} tệp`);
  }

  const mediaLabel = chunks.length > 0 ? chunks.join(" + ") : "Tệp đính kèm";
  return parsed.text ? `${parsed.text} (${mediaLabel})` : mediaLabel;
};

export const formatFileSize = (size) => {
  if (!size || Number.isNaN(size)) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${rounded} ${units[unitIndex]}`;
};
