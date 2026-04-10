# 从 QQ 号获取 QQ 头像

直接在浏览器或代码中构造URL，替换`QQ号码`为实际的QQ号即可。

- **普通头像**（推荐，稳定）：

  ```
  https://q1.qlogo.cn/g?b=qq&nk=QQ号码&s=100
  ```

  - `s=100`：100x100像素（常用）
  - 可换成 `s=40`（小）、`s=640`（较大）

- **高清头像**（推荐，质量更高）：

  ```
  https://q.qlogo.cn/headimg_dl?dst_uin=QQ号码&spec=640&img_type=jpg
  ```

  - `spec=640`：640x640像素高清

示例（以QQ号 10000 为例）：

- 普通：https://q1.qlogo.cn/g?b=qq&nk=10000&s=100
- 高清：https://q.qlogo.cn/headimg_dl?dst_uin=10000&spec=640&img_type=jpg

其他类似域名（如 q2.qlogo.cn、q3.qlogo.cn）也可以替换使用，效果差不多，偶尔能加速加载。
