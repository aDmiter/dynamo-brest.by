/** Настройка загрузки изображений для Jodit 4 (ответ должен содержать files[]) */

export type UploadApiResponse = {
  success?: boolean;
  url?: string;
  files?: string[];
  error?: string;
};

type JoditUploaderAnswer = {
  files: string[];
  /** Без этого Jodit вставляет <a> со ссылкой вместо <img> */
  isImages?: boolean[];
  path?: string;
  baseurl?: string;
  error?: number;
  msg?: string;
};

function normalizeUploaderResp(
  thisOrResp: unknown,
  maybeResp?: unknown
): UploadApiResponse & JoditUploaderAnswer {
  const raw = maybeResp !== undefined ? maybeResp : thisOrResp;
  if (!raw || typeof raw !== 'object') return { files: [] };
  return raw as UploadApiResponse & JoditUploaderAnswer;
}

export async function uploadImageToServer(
  file: File,
  folder = 'cms'
): Promise<UploadApiResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('storage', 'images');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  const data = (await res.json().catch(() => ({}))) as UploadApiResponse;
  if (!res.ok || !data.url) {
    return { success: false, error: data.error || `Ошибка загрузки (${res.status})` };
  }

  return { success: true, url: data.url, files: data.files ?? [data.url] };
}

function toJoditAnswer(resp: UploadApiResponse & JoditUploaderAnswer): JoditUploaderAnswer {
  if (Array.isArray(resp.files) && resp.files.length > 0) {
    return {
      files: resp.files,
      isImages: resp.files.map(() => true),
      path: '',
      baseurl: '',
      error: 0,
      msg: '',
    };
  }
  if (resp.url) {
    return {
      files: [resp.url],
      isImages: [true],
      path: '',
      baseurl: '',
      error: 0,
      msg: '',
    };
  }
  return {
    files: [],
    path: '',
    baseurl: '',
    error: 1,
    msg: resp.error || resp.msg || 'Не удалось загрузить файл',
  };
}

export function createJoditUploaderConfig(folder = 'cms') {
  return {
    url: '/api/upload',
    format: 'json' as const,
    withCredentials: true,
    filesVariableName: () => 'file',
    prepareData(this: unknown, formData: FormData) {
      if (!formData.has('folder')) formData.append('folder', folder);
      if (!formData.has('storage')) formData.append('storage', 'images');
      return formData;
    },
    isSuccess(thisOrResp: unknown, maybeResp?: unknown) {
      const resp = normalizeUploaderResp(thisOrResp, maybeResp);
      if (Array.isArray(resp.files) && resp.files.length > 0) return true;
      return Boolean(resp.success && resp.url);
    },
    getMessage(thisOrResp: unknown, maybeResp?: unknown) {
      const resp = normalizeUploaderResp(thisOrResp, maybeResp);
      return resp.msg || resp.error || '';
    },
    process(thisOrResp: unknown, maybeResp?: unknown) {
      return toJoditAnswer(normalizeUploaderResp(thisOrResp, maybeResp));
    },
    customUploadFunction: async (
      requestData: FormData,
      showProgress: (progress: number) => void
    ): Promise<JoditUploaderAnswer> => {
      const formData = requestData instanceof FormData ? requestData : new FormData();
      if (!formData.has('folder')) formData.append('folder', folder);
      if (!formData.has('storage')) formData.append('storage', 'images');

      const file = formData.get('file');
      if (!(file instanceof File)) {
        return { files: [], error: 1, msg: 'Файл не выбран' };
      }

      showProgress(15);
      const result = await uploadImageToServer(file, folder);
      showProgress(100);

      return toJoditAnswer(result);
    },
  };
}
