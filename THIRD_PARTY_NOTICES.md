# 第三方资源与许可声明

核对日期：2026-10-21。本文件记录当前仓库中第三方代码、模型及贴图的来源，不为本项目自有代码授予许可证，也不代表上游作者认可或赞助本项目。

**English:** Third-party components retain their own licenses. The application itself has no root project license at present. Version and provenance checks below identify the bundled files; they do not constitute a security audit or blanket license grant for the repository.

## 1. Three.js

- 范围：`vendor/three/three.module.js` 及 `vendor/three/examples/jsm/` 下的后处理、着色器模块。
- 版本：r160 / npm `three@0.160.0`。主文件中保留 `REVISION = '160'`、Three.js Authors 版权声明和 MIT SPDX 标识。
- 作者：Three.js authors。
- 许可：[MIT，r160 原始文本](https://github.com/mrdoob/three.js/blob/r160/LICENSE)。本仓库保留副本：[vendor/three/LICENSE](vendor/three/LICENSE)。
- 上游：[three.js](https://github.com/mrdoob/three.js/tree/r160)。
- 核对方式：主文件及全部 10 个附带模块逐字节匹配 [npm `three@0.160.0` 发布包](https://registry.npmjs.org/three/-/three-0.160.0.tgz)内对应文件。
- 主文件 SHA-256：`76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495`。

保留上游版权和许可声明。本次维护未改动上述第三方 JavaScript 文件。

## 2. MediaPipe Tasks Vision

- 范围：`vendor/mediapipe/vision_bundle.mjs` 及 `vendor/mediapipe/wasm/` 内列出的四个运行文件。
- 版本：**`@mediapipe/tasks-vision@0.10.14`**。
- 来源：[官方 npm 版本元数据](https://registry.npmjs.org/@mediapipe/tasks-vision/0.10.14)及[该版本发布包](https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.14.tgz)。发布包 SHA-1 与 npm 元数据的 `dist.shasum` 一致：`16c5ddc513408f2a416ccc6ce8ccc797ee02da3b`。
- 核对方式：将发布包内对应文件与当前仓库文件逐字节比较，以下五个文件全部相同；没有仅凭文件名推断版本。
- 上游：[Google MediaPipe v0.10.14](https://github.com/google-ai-edge/mediapipe/tree/v0.10.14)。
- 许可：Apache License 2.0。npm 版本元数据标注 `Apache-2.0`；上游该版本 [LICENSE](https://github.com/google-ai-edge/mediapipe/blob/v0.10.14/LICENSE) 已完整保存在 [vendor/mediapipe/LICENSE](vendor/mediapipe/LICENSE)，包括原文附带的第三方声明，不擅自删减。

| 相对于 `vendor/mediapipe/` 的文件 | SHA-256 |
| --- | --- |
| `vision_bundle.mjs` | `e77f281f9619150d937023c355bae170e9120e3b9e43f1e23a2a7bee07197669` |
| `wasm/vision_wasm_internal.js` | `9440cf0cc0cea21800e31581ec32aeedcc5fbf9df4509796bbc7d3f99e52ab9c` |
| `wasm/vision_wasm_internal.wasm` | `f82a8e6c05e08a44cc9f9e7ec5f845935bcbb1b1500ebe8c2f4812fb4e2917dc` |
| `wasm/vision_wasm_nosimd_internal.js` | `abe9b6fbeaf86fcb53a5edce3926c82ccb0619e18fed4d9d9ce561ee7f55e054` |
| `wasm/vision_wasm_nosimd_internal.wasm` | `38b61feab2fd7934e05cbe9f68baa308978a5e3b7f85c1913bb8ae89b8ef8b97` |

本次维护未改动这些文件。哈希用于固定来源与发现文件变动，不表示没有漏洞，也不表示已审计 WASM 内全部传递依赖的独立许可。

## 3. MediaPipe Hand Landmarker 模型

- 本地文件：`vendor/mediapipe/hand_landmarker.task`，7,819,105 字节。
- 固定来源：[Google 官方 Hand Landmarker float16，版本 1](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task)。本地文件与该下载逐字节一致。
- SHA-256：`fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`。
- 官方入口：[Hand landmarks detection guide](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker)。该指南的 Models 部分将模型包与下述模型卡关联。
- 许可依据：[Google 官方 Hand Tracking (Lite/Full) 模型卡，October 2021，第 2 页](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20Hand%20Tracking%20%28Lite_Full%29%20with%20Fairness%20Oct%202021.pdf)明确标注 Apache License, Version 2.0。许可文本见 [vendor/mediapipe/LICENSE](vendor/mediapipe/LICENSE)。这一结论来自模型卡和模型文件比对，**不是从 JavaScript 库的许可直接推定模型许可**。

模型用于手部关键点识别。模型卡说明其用途和局限；本项目不将其用于身份识别或生命攸关的判断。

## 4. Solar System Scope 贴图

- 署名：**Solar System Scope / INOVE**。
- 原始素材页：[Solar System Scope — Solar Textures](https://www.solarsystemscope.com/textures/)。
- 许可：[Creative Commons Attribution 4.0 International（CC BY 4.0）](https://creativecommons.org/licenses/by/4.0/)；[完整许可条款](https://creativecommons.org/licenses/by/4.0/legalcode)。官方素材页明确按该许可提供此纹理包。
- 使用方式：本项目将贴图映射至三维天体及背景，并通过材质、灯光、透明度与色调映射产生最终画面。上游原素材本身也包含调色和部分地形补全。
- 变更说明：本次维护没有修改下列图片文件。初始仓库已有 Solar System Scope 署名，但没有保存逐文件下载日志或加工记录；本次未完成图片与上游下载的逐字节核对，因此不宣称所有图片均为未经重新编码的上游原件。

仓库内归属于这一素材集的文件：

| 内容 | `textures/` 内文件 |
| --- | --- |
| 水星 | `2k_mercury.jpg`、`8k_mercury.jpg` |
| 金星大气 | `2k_venus_atmosphere.jpg`、`4k_venus_atmosphere.jpg` |
| 地球白天 | `2k_earth_daymap.jpg`、`8k_earth_daymap.jpg` |
| 地球夜景 | `2k_earth_nightmap.jpg` |
| 地球云层 | `2k_earth_clouds.jpg`、`8k_earth_clouds.jpg` |
| 火星 | `2k_mars.jpg`、`8k_mars.jpg` |
| 木星 | `2k_jupiter.jpg`、`8k_jupiter.jpg` |
| 土星 | `2k_saturn.jpg`、`8k_saturn.jpg` |
| 土星环 | `2k_saturn_ring_alpha.png` |
| 天王星 | `2k_uranus.jpg` |
| 海王星 | `2k_neptune.jpg` |
| 太阳 | `2k_sun.jpg`、`8k_sun.jpg` |
| 月球 | `2k_moon.jpg`、`8k_moon.jpg` |
| 星空与银河 | `2k_stars_milky_way.jpg` |

再分发或改编贴图时，应保留适当署名、素材来源、许可链接，并说明改动；不得暗示 Solar System Scope、INOVE、Google 或 Three.js 作者为本项目背书。不要因为纹理的部分基础数据来自 NASA，就忽略 Solar System Scope 对成品素材给出的许可。

## 5. 项目自有代码与更新原则

目前仓库没有根级项目 `LICENSE`。上述许可仅说明各第三方资源的适用范围，不替代版权持有人对 `index.html` 等项目自有内容的许可决定。

依赖、模型或素材发生变更时，应同时更新版本、来源、校验值、改动说明及必要的许可文本。未经重新核对，不要把这里的版本和哈希沿用到替换后的文件上。
