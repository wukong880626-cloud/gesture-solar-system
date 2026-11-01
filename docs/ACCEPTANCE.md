# 正式版本的验收与范围

2026-11-01，维护者确认已发布冻结候选版的手机/Safari操作、真实摄像头手势、关闭摄像头及切后台停止均正常，并要求开始正式更新。正式首页采用相同的页面和40份运行资源，不在验收后加入新的运行时代码。

## 候选身份与保留预览

- 指纹：`b106dbe1b04bd1b72da079142a7a31c575d59767fac1efefc1f5d2f35bf2a45d`。
- 页面 SHA-256：`256c95cf214ddd066bcf3d07e2029c4f8295f3678a691d96aa04380a6aab3d77`。
- [正式首页](https://wukong880626-cloud.github.io/gesture-solar-system/)。
- [保留的冻结预览](https://wukong880626-cloud.github.io/gesture-solar-system/preview/b106dbe1b04b/)。
- `candidate.json` 固定页面和运行资产哈希；其中 `base_commit` 是候选构建底本，不是部署提交。实际部署提交以 [PR #1](https://github.com/wukong880626-cloud/gesture-solar-system/pull/1) 和对应 [Actions 记录](https://github.com/wukong880626-cloud/gesture-solar-system/actions)为准。

## 两类证据分别记录

| 证据 | 已确认内容 | 限制 |
| --- | --- | --- |
| 用户真实验收反馈，2026-11-01 | 指定预览的手机/Safari、真实手势、关闭/后台停止正常 | 不是助手独立实测；具体设备和版本未记录，不能外推所有设备 |
| Node 回归 | 摄像头生命周期、交互状态、模块资源、Pages子目录；新增正式/预览逐字节一致性检查 | VM/静态检查不能证明真实识别质量 |
| 独立无头 Chrome | WebGL、键鼠、布局、触屏模拟、拒绝权限、合成流配合真实模型/WASM | 触屏与后台事件有模拟部分；未打开真实摄像头 |
| HTTPS预览部署核对 | 提交/CI成功、资源路径/MIME、冻结指纹与关键文件哈希一致 | 真实设备反馈仍单独列示 |

发布期间仅使用无头浏览器、拒绝权限或合成视频流，不重新开启摄像头，也不走曾挂起的Safari CUA路径。CI使用Node 24和只读仓库权限。

## 仍未独立验收的范围

Firefox、读屏器、系统级减少动态效果、全量移动设备/浏览器组合以及帧率和内存上限未完成独立验收。用户反馈通过不等于自动化跨浏览器认证。全部科学知识卡也尚未逐项审校；会变化的数据应按README的来源和核对日期复核。

## 许可与发布边界

自有代码、文档、测试按根目录MIT许可，署名 `wukong880626-cloud`（2026）；第三方代码、模型和贴图继续遵守 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。保留已有预览和无关文件；不公开本地执行产物、私人文件或摄像头画面，不新增服务、凭据、付费或持久权限。
