import { ArrowLeftOutlined, ArrowRightOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Space, Tooltip, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { HttpError } from '@refinedev/core';
import { api, uploadUrl } from '../../lib/http';

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_IMAGES = 12;

/**
 * A list of pictures in order (stored paths, "projects/gallery/….webp"): several
 * files can be chosen at once, each uploaded straight away under `preset`, then
 * moved earlier or later, or removed. Uploads finishing together are all kept
 * (the latest list is in a ref, not in the value of the render that started them).
 */
export function GalleryUpload({ value, onChange, preset = 'project-gallery' }: { value?: string[] | null; onChange?: (value: string[]) => void; preset?: string }) {
    const { message } = App.useApp();
    const [busy, setBusy] = useState(0);
    const items = value ?? [];
    const latest = useRef(items);
    useEffect(() => {
        latest.current = value ?? [];
    }, [value]);

    const update = (next: string[]) => {
        latest.current = next;
        onChange?.(next);
    };
    const move = (from: number, to: number) => {
        const next = [...items];
        const [path] = next.splice(from, 1);
        next.splice(to, 0, path);
        update(next);
    };

    return (
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {items.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                    {items.map((path, i) => (
                        <div key={path} style={{ border: '1px solid rgb(127 127 127 / .3)', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'rgb(127 127 127 / .08)' }}>
                                <img src={uploadUrl(path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <span
                                    style={{
                                        position: 'absolute',
                                        insetInlineStart: 6,
                                        top: 6,
                                        minWidth: 22,
                                        padding: '0 6px',
                                        borderRadius: 11,
                                        background: 'rgb(0 0 0 / .6)',
                                        color: '#fff',
                                        fontSize: 12,
                                        lineHeight: '22px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {i + 1}
                                </span>
                            </div>
                            <Space size={4} style={{ display: 'flex', justifyContent: 'space-between', padding: 6 }}>
                                <Space size={4}>
                                    <Tooltip title="قبلها">
                                        <Button size="small" icon={<ArrowRightOutlined />} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="قبلها" />
                                    </Tooltip>
                                    <Tooltip title="بعدها">
                                        <Button size="small" icon={<ArrowLeftOutlined />} disabled={i === items.length - 1} onClick={() => move(i, i + 1)} aria-label="بعدها" />
                                    </Tooltip>
                                </Space>
                                <Tooltip title="شيل الصورة">
                                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => update(items.filter((_, j) => j !== i))} aria-label="شيل الصورة" />
                                </Tooltip>
                            </Space>
                        </div>
                    ))}
                </div>
            )}

            {items.length < MAX_IMAGES && (
                <Upload
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                        if (file.size > MAX_BYTES) {
                            message.error(`${file.name}: الصورة أكبر من 8 ميجا.`);
                            return Upload.LIST_IGNORE;
                        }
                        return true;
                    }}
                    customRequest={async ({ file, onSuccess, onError }) => {
                        setBusy((n) => n + 1);
                        try {
                            if (latest.current.length >= MAX_IMAGES) {
                                throw new Error(`أقصى عدد ${MAX_IMAGES} صورة.`);
                            }
                            const form = new FormData();
                            form.append('file', file as Blob);
                            form.append('preset', preset);
                            const { path } = await api<{ path: string }>('/uploads', { method: 'POST', body: form });
                            update([...latest.current, path]);
                            onSuccess?.(path);
                        } catch (error) {
                            message.error((error as HttpError).message);
                            onError?.(error as Error);
                        } finally {
                            setBusy((n) => n - 1);
                        }
                    }}
                >
                    <Button icon={<PlusOutlined />} loading={busy > 0}>
                        {items.length ? 'ضيف صور تانية' : 'ضيف صور'}
                    </Button>
                </Upload>
            )}
        </Space>
    );
}
