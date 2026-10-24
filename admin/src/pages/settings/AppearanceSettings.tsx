import { ReloadOutlined } from '@ant-design/icons';
import { Button, Form, Radio, Space, Switch, Typography } from 'antd';
import { useState } from 'react';
import { Section } from '../../components/form/Section';
import { LoaderIntro } from '../../components/LoaderIntro';
import { SettingsPage } from '../../components/settings/SettingsPage';

const SETTING_KEYS = ['appearance.loader', 'appearance.theme', 'appearance.floating_contact'];

/** The site's loader intro, replayed with the button. */
function LoaderPreview() {
    const [run, setRun] = useState(0);
    return (
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <div className="loader-preview" key={run}>
                <LoaderIntro />
            </div>
            <Button icon={<ReloadOutlined />} onClick={() => setRun((n) => n + 1)}>
                إعادة العرض
            </Button>
        </Space>
    );
}

export function AppearanceSettings() {
    return (
        <SettingsPage title="المظهر وشاشة التحميل" settingKeys={SETTING_KEYS} textKeys={[]} viewPath="/">
            <Section title="شاشة التحميل" description="اللوجو بيتركّب قدام الزائر، وبعدين اسم كودلك بيطلع منه: نص الدايرة بيبقى حرف d والنقط بتبقى حرف l، وبعدها باقي الحروف.">
                <LoaderPreview />
                <Form.Item name={['settings', 'appearance.loader']} label="تظهر إمتى">
                    <Radio.Group>
                        <Space direction="vertical">
                            <Radio value="session">
                                <b>ترحيب كامل في أول صفحة بس</b>
                                <br />
                                <Typography.Text type="secondary">
                                    المستحسن: الحركة كاملة (حوالي ثانيتين) أول ما الزائر يدخل الموقع، والصفحات بعدها بتفتح على طول. اللي مفعّل تقليل الحركة على جهازه بيشوف اللوجو من غير حركة.
                                </Typography.Text>
                            </Radio>
                            <Radio value="always">
                                <b>لحد ما الصفحة الأولى تجهز</b>
                                <br />
                                <Typography.Text type="secondary">
                                    اللوجو بيغطي وقت التحميل بس، فلو الصفحة فتحت بسرعة الحركة بتتقطع وبتظهر بنعومة. التنقل بين الصفحات بعدها بيبقى فوري.
                                </Typography.Text>
                            </Radio>
                            <Radio value="off">
                                <b>من غير شاشة تحميل</b>
                                <br />
                                <Typography.Text type="secondary">الصفحة بتظهر على طول.</Typography.Text>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
            </Section>

            <Section title="الوضع الافتراضي" description="اللي يشوفه الزائر أول مرة. يقدر يغيّره بزرار القمر في الهيدر، واختياره بيتحفظ عنده.">
                <Form.Item name={['settings', 'appearance.theme']}>
                    <Radio.Group>
                        <Space direction="vertical">
                            <Radio value="light">فاتح</Radio>
                            <Radio value="dark">غامق</Radio>
                            <Radio value="system">
                                زي جهاز الزائر
                                <br />
                                <Typography.Text type="secondary">لو موبايل أو كمبيوتر الزائر على الوضع الليلي، الموقع يفتح غامق.</Typography.Text>
                            </Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
            </Section>

            <Section title="زرار التواصل العائم" description="الدايرة اللي في ركن الشاشة وفيها واتساب والاتصال وحسابات السوشيال.">
                <Form.Item name={['settings', 'appearance.floating_contact']} label="يظهر في كل الصفحات" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Section>
        </SettingsPage>
    );
}
