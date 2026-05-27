/**
 * Motion components index.
 *
 * 这个文件是动画组件的统一出口，同时也是给 Codex / 后续维护者看的使用说明。
 *
 * 使用原则：
 * - 不要在动画组件里写业务逻辑；
 * - 不要在动画组件里请求链上数据；
 * - 动画组件只负责视觉增强；
 * - 优先包裹现有 Card / Panel / Button / Record 区域，不要重写业务组件；
 * - 添加动画时，必须保证 `npm run build` 通过。
 */

/**
 * 通用入场动画预设。
 *
 * 适用场景：
 * - 页面 Hero 区域
 * - 普通内容块
 * - 右侧状态面板
 * - 任意需要轻量进入动画的区域
 *
 * 组件说明：
 * - MotionFadeUp：从下往上浮现，带轻微 blur，最常用；
 * - MotionFadeIn：原地淡入，适合文字、状态、小组件；
 * - MotionScaleIn：缩放淡入，适合 Card / Modal / Panel；
 * - MotionSlideLeft：从左侧滑入，适合左栏主内容；
 * - MotionSlideRight：从右侧滑入，适合右栏状态栏；
 * - MotionPop：弹性出现，适合徽章、标签、关键数字。
 */
export {
  MotionFadeIn,
  MotionFadeUp,
  MotionPop,
  MotionScaleIn,
  MotionSlideLeft,
  MotionSlideRight,
} from "./MotionPreset";

/**
 * 列表错峰动画。
 *
 * 适用场景：
 * - Claim Flow 四个步骤；
 * - Feature tags；
 * - Reward Records 列表；
 * - Eligibility Records 列表；
 * - 多个 Card 并排出现的区域。
 *
 * 使用方式：
 *   <StaggerContainer>
 *     <StaggerItem>...</StaggerItem>
 *     <StaggerItem>...</StaggerItem>
 *   </StaggerContainer>
 *
 * 效果：
 * - 子元素按顺序依次淡入；
 * - 带轻微上移动画和 blur；
 * - 适合让页面更有层次感。
 */
export { StaggerContainer, StaggerItem } from "./StaggerContainer";

/**
 * AnimatedPanel
 *
 * 适用场景：
 * - WalletPanel
 * - NetworkStatus
 * - CampaignPanel
 * - EligibilityPanel
 * - ClaimPanel
 * - RewardPanel
 *
 * 效果：
 * - Card 进入时淡入、上浮、缩放；
 * - hover 时轻微上浮；
 * - 可选 glow 发光背景；
 * - 适合直接包裹整个业务 Panel。
 *
 * 建议：
 * - 不要替换原来的 Card 内容；
 * - 只在外层包一层 AnimatedPanel。
 */
export { AnimatedPanel } from "./AnimatedPanel";

/**
 * AnimatedButton
 *
 * 适用场景：
 * - Issue Real Eligibility 按钮；
 * - Claim on Local Devnet 按钮；
 * - Refresh Campaign 按钮；
 * - Mock fallback 按钮。
 *
 * 效果：
 * - hover 轻微放大；
 * - tap 点击回弹；
 * - 带流光扫过效果；
 * - 适合强调主要操作。
 *
 * 注意：
 * - 如果项目已经使用 shadcn/ui Button，优先用 motion 包裹外层；
 * - 不要破坏原有 disabled / onClick / loading 逻辑。
 */
export { AnimatedButton } from "./AnimatedButton";

/**
 * StatusPulse
 *
 * 适用场景：
 * - Network Ready
 * - Local Devnet
 * - Connected
 * - Confirmed
 * - Failed / Error
 *
 * 效果：
 * - 左侧状态点持续脉冲；
 * - 根据 tone 显示 green / yellow / red / blue / zinc；
 * - 适合替代普通 Badge 或放在 Badge 旁边。
 */
export { StatusPulse } from "./StatusPulse";

/**
 * NumberTicker
 *
 * 适用场景：
 * - CampaignPanel 里的 Claimed Users；
 * - CampaignPanel 里的 Claimed Amount；
 * - 其他链上统计数字。
 *
 * 效果：
 * - 数字从 0 平滑滚动到目标值；
 * - 自动识别 `1000u64` 里的数字部分；
 * - 默认保留 `u64` 后缀。
 *
 * 注意：
 * - 适合展示链上统计；
 * - 不适合展示 address、txId、record 原文。
 */
export { NumberTicker } from "./NumberTicker";

/**
 * ZkCircuitBackground
 *
 * 适用场景：
 * - 页面最外层背景；
 * - app/page.tsx 顶部；
 * - 整个 ZK Airdrop 页面。
 *
 * 效果：
 * - 深色 ZK 科技背景；
 * - 漂浮节点；
 * - 动态虚线电路；
 * - 绿色 / 青色 glow；
 * - 适合增强零知识证明应用氛围。
 *
 * 使用建议：
 * - 放在页面根节点内最前面；
 * - 只放一次；
 * - 不要放到 Card 内部。
 */
export { ZkCircuitBackground } from "./ZkCircuitBackground";

/**
 * ZkProofOrb
 *
 * 适用场景：
 * - Hero 区域右侧；
 * - 页面顶部视觉主元素；
 * - ZK proof / privacy / record 概念展示。
 *
 * 效果：
 * - 旋转环；
 * - 发光球；
 * - 漂浮粒子；
 * - 适合提升首屏视觉冲击力。
 */
export { ZkProofOrb } from "./ZkProofOrb";

/**
 * TransactionReveal
 *
 * 适用场景：
 * - Issue transaction ID 区域；
 * - Claim transaction ID 区域；
 * - Raw Reward record 展示前的成功状态；
 * - 交易确认后的信息块。
 *
 * 效果：
 * - 交易块淡入；
 * - 横向扫光；
 * - 右上角成功脉冲点；
 * - 适合表达“交易已揭示 / 已确认”。
 */
export { TransactionReveal } from "./TransactionReveal";

/**
 * RecordCardMotion
 *
 * 适用场景：
 * - Eligibility Record 卡片；
 * - Reward Record 卡片；
 * - Raw record 展示区域；
 * - 表格中的单条 record 展示。
 *
 * 效果：
 * - record 卡片从 blur 状态解密式浮现；
 * - 顶部有扫描线；
 * - hover 时轻微上浮和边框高亮；
 * - 适合表达“私有记录被扫描出来”。
 */
export { RecordCardMotion } from "./RecordCardMotion";

/**
 * ProofStepMotion
 *
 * 适用场景：
 * - Claim Flow 中的 01 / 02 / 03 / 04 步骤；
 * - ZK proof 流程步骤；
 * - 任何流程型卡片。
 *
 * 效果：
 * - 每个步骤按 index 延迟进入；
 * - hover 时上浮；
 * - active 状态下有动态 glow；
 * - 适合让流程步骤更有层次。
 */
export { ProofStepMotion } from "./ProofStepMotion";

/**
 * TypingText
 *
 * 适用场景：
 * - Hero 副标题；
 * - ZK app slogan；
 * - 短说明文字；
 * - onboarding 提示。
 *
 * 效果：
 * - 字符逐个淡入；
 * - 带轻微上移和 blur；
 * - 适合少量文本，不建议用于长段落。
 */
export { TypingText } from "./TypingText";

/**
 * QuestRewardBurst
 *
 * 用于单个任务完成后的奖励反馈。
 * 适合显示 +amount 和 tier unlock。
 * 不处理业务状态，只负责视觉动画。
 */
export { QuestRewardBurst } from "./QuestRewardBurst";

/**
 * QuestCompletionBurst
 *
 * 用于所有任务完成后的满级奖励反馈。
 * 适合显示 Max Tier Achieved / Full Eligibility Unlocked。
 * 不处理业务状态，只负责视觉动画。
 */
export { QuestCompletionBurst } from "./QuestCompletionBurst";
