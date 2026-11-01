# 手势太阳系 · 互动课堂

用浏览器探索太阳、八大行星和月球的中文 3D 互动课堂。可用摄像头手势，也可完全不用摄像头，通过鼠标、触屏或键盘操作。

**English:** A browser-based, Chinese-language 3D solar-system classroom with optional on-device hand tracking and mouse, touch, and keyboard controls. All runtime libraries, models, and textures are bundled. This is an illustrative educational scene, not an astronomical ephemeris.

项目仓库：[wukong880626-cloud/gesture-solar-system](https://github.com/wukong880626-cloud/gesture-solar-system)。

正式入口：[手势太阳系互动课堂](https://wukong880626-cloud.github.io/gesture-solar-system/)。保留的[冻结预览](https://wukong880626-cloud.github.io/gesture-solar-system/preview/b106dbe1b04b/)与本次正式运行版本具有相同指纹；验收来源与限制见[验收记录](docs/ACCEPTANCE.md)。

## 可以做什么

- 浏览太阳、八大行星、月球、土星环和小行星带。
- 点选天体查看中文知识卡，或用底部按钮直接切换目标。
- 旋转、缩放、返回全景；调整动画速度，或开启自动巡游。
- 选择无摄像头模式；手势模式支持随时关闭摄像头。
- 使用键盘访问控件；尊重系统的“减少动态效果”偏好。

## 本地运行

这是静态网页，不需要 Node.js、打包器、API Key 或后端服务。需要 Python 3 和支持 ES modules、import maps、WebGL 的现代浏览器；手势模式还需要 WebAssembly 和可用摄像头。

1. 下载并解压仓库，或克隆：

   ```sh
   git clone https://github.com/wukong880626-cloud/gesture-solar-system.git
   cd gesture-solar-system
   ```

2. 在包含 `index.html` 的目录启动本地静态服务：

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

   Windows 也可使用 `py -m http.server 8000 --bind 127.0.0.1`。

3. 打开 <http://localhost:8000>，选择“无摄像头模式”或“手势模式”。结束后，在终端按 `Ctrl+C` 停止服务。

不要直接双击 `index.html`：`file://` 下的模块和资源加载可能被浏览器限制。请完整保留 `vendor/` 和 `textures/` 目录。

### 摄像头与部署要求

- 浏览器摄像头访问需要安全上下文：本机开发使用 `localhost`，远程部署使用 **HTTPS**，并由使用者授予摄像头权限。[浏览器权限说明](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security)
- 手机访问电脑的普通 `http://局域网IP:端口` 不等于手机自己的 `localhost`，摄像头通常不可用。可先用无摄像头模式，或部署到配置好 HTTPS 的静态服务器。
- 静态托管需原样提供全部资源，正确返回 JavaScript 模块和 `.wasm` 的内容类型；不要把不存在的资源重写成 `index.html`。
- `python -m http.server` 仅用于本地预览，不是生产服务器。本示例绑定回环地址，不会直接开放给局域网其他设备。
- 应用运行资源都已随仓库提供，不依赖 CDN 实时下载。完整下载后可在断开外网、保留本地服务的情况下使用；这不代表部署后的网页具备 Service Worker 离线缓存。

### GitHub Pages 项目子目录

项目使用站点内相对路径，支持 `https://wukong880626-cloud.github.io/gesture-solar-system/` 这样的项目子目录。保留末尾 `/`，并完整保留 `vendor/`、`textures/`；不要把 import map、模型或 WASM 地址改成以 `/vendor/` 或 `/textures/` 开头的站点根路径。

当前仓库的 Pages 来源是 `main` 分支根目录。推送到该来源会自动更新公网。2026-11-01维护者反馈冻结候选的手机/Safari、真实手势和关闭/后台停止均正常，并明确要求正式更新；本次首页提升保持同一候选的运行文件字节，保留预览及第三方归属。证据来源与未覆盖范围见[验收记录](docs/ACCEPTANCE.md)。

## 操作说明

### 鼠标、触屏与键盘

| 目的 | 操作 |
| --- | --- |
| 查看天体 | 点击天体，或选择底部天体按钮 |
| 旋转视角 | 鼠标拖动 / 单指拖动 |
| 缩放 | 鼠标滚轮 / 双指捏合 |
| 返回全景 | “全景”按钮、点击空白处或 `Esc` |
| 键盘访问按钮 | `Tab` / `Shift+Tab` 移动焦点，`Enter` 或空格激活 |
| 键盘旋转 | 三维画布获得焦点时，使用方向键 |
| 键盘缩放 | 画布获得焦点时，`+` 或 `=` 放大，`-` 缩小 |
| 暂停 / 继续 | 底部播放按钮；画布获得焦点时可按空格切换暂停 / 1× |
| 自动巡游 | 点击“巡游”；再次点击停止，手动选择天体也会停止巡游 |

方向键、缩放键和空格的画布快捷键只在画布有焦点时生效，避免影响其他按钮的正常键盘操作。画布可通过 `Tab` 访问。

暂停会停止天体自转、公转和自动巡游，但仍可手动调整视角，相机过渡可能短暂收敛。若页面打开时系统启用了“减少动态效果”，默认暂停天体动画并关闭自动视角旋转；仍可主动点击播放或巡游。

### 摄像头手势

1. 点击“手势模式”或“开启手势”，允许浏览器使用摄像头。
2. 将手放在光线充足的画面中。食指指向目标，屏幕光圈用于定位。
3. 拇指与食指快速轻捏后松开：选中天体或按钮。
4. 捏住并移动：旋转视角。双手同时捏合并拉开 / 靠近：缩放。
5. 点击“关闭摄像头”可继续使用鼠标、触屏或键盘，无需刷新页面。

若从开始页启动摄像头，等待期间可点“无摄像头模式”取消；若已进入场景后再开启，则可点底部“取消开启摄像头”。切换到后台会关闭摄像头，回到页面后需主动重新开启；应用不会自动恢复摄像头。

手势识别会受光线、遮挡、距离、设备性能和摄像头质量影响，不是操作本应用的必要条件。

## 隐私与资源加载

- 本应用仅在用户选择手势模式后申请摄像头，未申请麦克风。
- 视频帧交给浏览器内的 MediaPipe 模型处理，手部关键点用于交互。当前应用源码未包含视频上传、录像存储或分析统计代码。
- Three.js、MediaPipe JavaScript / WASM、模型和贴图均从同一站点的本地路径加载。服务器仍会收到普通页面与静态文件请求；托管平台、浏览器扩展和外部链接有各自的数据处理行为，不在本应用的控制范围内。
- 不愿开启或无法使用摄像头时，请选择“无摄像头模式”。

## 科学表达的边界

场景中的**天体尺寸、轨道距离、运行速度、初始位置和光照效果经过教学可视化处理**，不按统一真实比例，也不是某一时刻的真实星历。不要用画面测量距离、预测天象或比较真实公转速度。

已澄清水星“自转周期”与“太阳日”的区别：[NASA Mercury Facts](https://science.nasa.gov/mercury/facts/) 分别给出约 59 和 176 个地球日。第二轮修正了天王星轴倾角说明、太阳与地球的直径比标签，以及海王星风速表述。

2026-10-22 核对外行星的已知卫星数：木星 **115**、土星 **293**、天王星 **29**、海王星 **16**。知识卡显示核对日期，数量可能继续更新。来源为 [NASA/JPL 卫星发现表](https://ssd.jpl.nasa.gov/sats/discovery.html)、[木星事实页](https://science.nasa.gov/jupiter/jupiter-facts/)、[土星卫星页](https://science.nasa.gov/saturn/moons/)、[天王星卫星页](https://science.nasa.gov/uranus/moons/)和[海王星事实页](https://science.nasa.gov/neptune/neptune-facts/)。天王星的通用事实页仍显示旧的 28，本次采用卫星专页及 JPL 表中一致的 29。

这些是明显问题的定点复核，尚未完成全部知识卡数值、定义和来源的逐项审校。

知识卡用于入门介绍，数值经过取整；会变化的信息应在用于正式教学前复核。贴图也可能包含艺术化调色或补全，不等同于未经处理的航天照片。有关贴图来源见[第三方声明](THIRD_PARTY_NOTICES.md)。

## 目录与维护

```text
index.html                  页面、交互与场景代码
textures/                   行星、太阳、月球和星空贴图
vendor/three/               Three.js r160 与后处理模块
vendor/mediapipe/           Tasks Vision 0.10.14、WASM 与手部模型
tests/                      Node.js 隔离逻辑与静态检查
README.md                   使用、运行与维护说明
THIRD_PARTY_NOTICES.md       第三方来源、许可与已验证哈希
```

- 调整天体知识卡、交互或界面时，修改 `index.html`；不要直接修改压缩的第三方运行库。
- 更换依赖时固定具体版本，将 JavaScript 与同版本 WASM 一起更新，复测后同步更新第三方声明和哈希。不要只把路径改为 `latest`。
- 更换贴图或模型时记录来源、许可及加工内容，不要把第三方资源默认为项目作者原创。

### 验证与验收

开发检查使用 Node.js 内置测试运行器，无需安装 npm 依赖。安装 Node.js 18 或更新版本后，在项目根目录运行；本地发布复核使用 Node.js 23.11.0，CI配置为Node 24：

```sh
node --test tests/*.test.mjs
```

2026-10-21 的维护检查：**20 项测试通过**，覆盖源码语法和本地资源引用、摄像头生命周期及失败清理、迟到的视频流 / 模型取消、重复启动、后台关闭、连续推理失败、指针点击 / 拖动 / 双指 / 取消、滚轮缩放、暂停状态、画布键盘快捷键及导航按钮状态 / 节点稳定性、手势关闭摄像头的帧退出及后处理错误阈值。

以上 20 项使用 VM、模拟 DOM 和模拟 MediaPipe。第二轮另增加三组实际浏览器验收脚本，覆盖 WebGL渲染、鼠标/键盘/模拟触屏、布局、浏览器原生拒绝摄像头，以及合成视频流配合真实本地MediaPipe/WASM的清理流程。Pages路径与候选完整性检查会确认正式页面、预览和资产哈希一致；结果归属与边界见[验收记录](docs/ACCEPTANCE.md)。

浏览器脚本需另装 Playwright CLI；它仅用于维护，不是运行网页的依赖。先在一个终端运行 `python3 -m http.server 8766 --bind 127.0.0.1`，另一个终端在项目根目录运行：

```sh
node tests/run-browser-acceptance.mjs
```

若 `playwright-cli` 不在 PATH，可用 `PLAYWRIGHT_CLI=/绝对路径/playwright-cli.js node tests/run-browser-acceptance.mjs`。脚本使用独立无头会话，退出码反映检查是否失败；JSON、日志和截图写入 `output/playwright/`。摄像头权限被明确拒绝，成功路径只使用 `canvas.captureStream()` 合成画面，绝不调用原生摄像头。背景与离页清理使用浏览器 DOM 事件模拟。

可用 `SOLAR_BASE_URL=http://127.0.0.1:8766/gesture-solar-system/` 复测 Pages 子目录；这时静态服务的目录应是项目文件夹的父目录，使 URL 中的 `gesture-solar-system/` 指向本项目。CI 执行 Node 回归与子目录资源路径检查，不能替代实际浏览器及真实设备验收。

**2026-11-01用户反馈：指定冻结候选的手机/Safari、真实摄像头手势及关闭/切后台停止均正常。** 这是用户验收反馈，不是助手独立硬件测试；具体设备与版本未记录，Firefox、读屏器、系统级减少动态效果和全部设备组合仍未独立验收。

已完成的资源核对：本地 MediaPipe JavaScript 与四个 WASM 运行文件逐字节匹配官方 npm `0.10.14` 发布包；手部模型逐字节匹配 Google 官方 `float16/1` 模型。详细证据见[第三方声明](THIRD_PARTY_NOTICES.md)。

资源或源码检查不等于真实设备验收。发布或课堂使用前，请至少检查：

1. 无摄像头模式能加载场景；天体点选、全景、缩放、速度和巡游可用。
2. `Tab` 顺序、按钮激活及画布快捷键可用；减少动态效果设置下行为合理。
3. 摄像头允许、拒绝、关闭、重复开启及启动中取消均可恢复，不遗留活动视频流。
4. 在真实手部画面中测试轻捏、拖动、双手缩放；关闭摄像头后确认浏览器使用指示消失。
5. 在实际要使用的手机 / 平板和浏览器上测试触屏与性能；检查资源加载失败提示。

本文不声明已经完成所有浏览器、真实摄像头和移动设备的兼容性测试，也不提供帧率保证。

## 常见问题

- **摄像头打不开：** 确认是 HTTPS 或本机 localhost，检查浏览器站点权限与操作系统摄像头权限，并关闭可能占用摄像头的软件。也可直接改用无摄像头模式。
- **模型或图片加载失败：** 检查是否下载了完整仓库、是否从项目根目录启动服务，以及静态服务器是否把 `.mjs` / `.wasm` / `.task` 错误返回成 HTML。模型已随仓库提供，不需要另接在线 AI 服务。
- **画面卡顿：** 先用无摄像头模式，关闭其他高负载标签页，并在目标教学设备上预演。高分辨率贴图、后处理和手部识别都会占用内存及图形资源。
- **报告问题：** 在[项目 Issues](https://github.com/wukong880626-cloud/gesture-solar-system/issues)说明浏览器版本、设备、操作模式、复现步骤与错误文字。请勿上传学生或旁人的摄像头画面；优先提供不含个人影像的截图。

## 许可状态

项目自有代码、文档和测试按 [MIT LICENSE](LICENSE) 开源，署名 `wukong880626-cloud`（2026），版权持有人已明确批准此许可。

第三方组件保留各自许可：Three.js 为 MIT，MediaPipe 与已核对的手部模型为 Apache 2.0，Solar System Scope 贴图为 CC BY 4.0。版本、适用范围、署名、来源与核对限制见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。根目录 MIT 不替代第三方许可证，尤其不能将贴图署名与许可要求移除。
