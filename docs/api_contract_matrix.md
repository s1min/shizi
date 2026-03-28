# 趣字宝 API 契约矩阵（前后端对齐）

> 更新日期：2026-03-27  
> 说明：本矩阵用于约束前端调用面与后端实际实现，避免接口漂移。  
> 后端全局前缀：`/api`

---

## 一、已启用接口（主流程）

| 域 | 前端封装 | 方法 | 路径 | 后端实现 | 状态 |
|---|---|---|---|---|---|
| Auth | `wxLogin(code)` | `POST` | `/api/auth/wxLogin` | `AuthController.wxLogin` | ✅ 启用 |
| Auth | `logout()` | `POST` | `/api/auth/logout` | `AuthController.logout` | ✅ 启用 |
| User | `getUserInfo()` | `GET` | `/api/user/info` | `UserController.getInfo` | ✅ 启用 |
| User | `updateInfo(data)` | `PUT` | `/api/user/updateInfo` | `UserController.updateInfo` | ✅ 启用 |
| User | `updateChild(data)` | `PUT` | `/api/user/child` | `UserController.updateChild` | ✅ 启用 |
| Learning | `getProgress()` | `GET` | `/api/learning/progress` | `LearningController.getProgress` | ✅ 启用 |
| Learning | `putProgress(data)` | `PUT` | `/api/learning/progress` | `LearningController.putProgress` | ✅ 启用 |
| Learning | `syncProgress(data)` | `POST` | `/api/learning/sync` | `LearningController.syncProgress` | ✅ 启用 |
| Learning | （暂未接入） | `GET` | `/api/learning/review-list` | `LearningController.getReviewList` | 🟡 后端有，前端未用 |
| Library | `getLibraries()` | `GET` | `/api/libraries` | `LibraryController.findAll` | ✅ 启用 |
| Library | `getLibraryById(id)` | `GET` | `/api/libraries/:id` | `LibraryController.findById` | ✅ 启用 |
| Character | `getCharactersBatch(ids)` | `GET` | `/api/characters/batch` | `CharacterController.getBatch` | ✅ 启用 |

---

## 二、已收敛/未启用接口

下列接口在旧模板中存在，但不属于当前 MVP 后端能力，已从调用面移除或禁用：

| 接口 | 处理方式 | 原因 |
|---|---|---|
| `/api/auth/login` | 前端调用已移除 | MVP 使用微信登录，不支持账号密码登录 |
| `/api/auth/refreshToken` | 前端调用已禁用（双 token 预留） | 当前后端仅支持单 token |
| `/api/user/getCode` | 前端调用已移除 | 无验证码登录流程 |
| `/api/user/updatePassword` | 前端调用已移除 | 无账号密码体系 |

---

## 三、契约约束（执行规则）

1. 前端新增 `api/*` 方法时，必须在本矩阵中登记“方法 + 路径 + 状态”。
2. 后端新增 Controller 路由时，必须同步补充前端封装或明确标注“后端预留”。
3. 禁止在未登记契约的情况下直接调用新接口。
4. 若接口 method/path 改动，前后端代码与本矩阵必须同一提交完成。

---

## 四、当前前端登录策略说明

1. MVP 仅使用微信登录 `wx.login -> /auth/wxLogin`。
2. Token 模式为单 token；双 token 刷新逻辑保留为“框架预留”，默认不启用。
3. 若未来启用双 token，需先补后端 `refreshToken` 接口，再更新本矩阵状态。

