'use client';

import Link from 'next/link';

/*
 * The last resort, when the root layout itself fails: the fonts, styles and
 * texts are what broke, so it shows a plain bilingual message.
 */
export default function GlobalError() {
    return (
        <html lang="ar" dir="rtl">
            <body style={{ margin: 0, padding: '4rem 1rem', textAlign: 'center', fontFamily: 'Cairo, system-ui, sans-serif' }}>
                <h1>حدث خطأ غير متوقع</h1>
                <p>حاول مرة أخرى بعد قليل.</p>
                <p dir="ltr">Something went wrong. Please try again in a moment.</p>
                <Link href="/">الرئيسية · Home</Link>
            </body>
        </html>
    );
}
