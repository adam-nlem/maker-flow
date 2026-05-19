export enum FileInvalidReason {
    MissingFile = 'missing_file',
    TooManyFiles = 'too_many_files',
    TooFewFiles = 'too_few_files',
    FileTooLarge = 'file_too_large',
    InvalidMimeType = 'invalid_mime_type',
    InvalidPayload = 'invalid_payload',
}

export const fileInvalidReasonTranslationKeys: Record<FileInvalidReason, string> = {
    [FileInvalidReason.MissingFile]: 'enums:fileInvalidReason.missingFile',
    [FileInvalidReason.TooManyFiles]: 'enums:fileInvalidReason.tooManyFiles',
    [FileInvalidReason.TooFewFiles]: 'enums:fileInvalidReason.tooFewFiles',
    [FileInvalidReason.FileTooLarge]: 'enums:fileInvalidReason.fileTooLarge',
    [FileInvalidReason.InvalidMimeType]: 'enums:fileInvalidReason.invalidMimeType',
    [FileInvalidReason.InvalidPayload]: 'enums:fileInvalidReason.invalidPayload',
};
