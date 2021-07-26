
function Timeline(opt) {
  // 远程数据源配置
  let remote = opt.remote || {};
  let local = opt.local || {};

  this.url = remote.url;
  this.usecase = remote.usecase;

  // 本地数据源配置
  this.data = local.data || [];

  this.model = opt.model;

  // 标题显示函数
  this.fnTitle = this.model.fnTitle;
  // 内容显示函数
  this.fnContent = this.model.fnContent;
  // 判断此步骤是否结束
  this.fnCompleted = this.model.fnCompleted;
}

Timeline.prototype.render = function(container, params) {
  if (typeof container === 'string') {
    this.container = document.querySelector(container);
  } else {
    this.container = container;
  }
  this.container.innerHTML = '';

  let timeline = dom.create('div', 'timeline');
  for (let i = 0; i < this.data.length; i++) {
    let row = this.data[i];
    let timelineItem = dom.element(`
      <div class="timeline-item">
        <div class="timeline-icon done">
        </div>
        <div class="timeline-content done">
          <div class="timeline-title done">${this.fnTitle(row)}</div>
          <div style="margin-top: 10px;">
            ${this.fnContent(row)}
          </div>
        </div>
      </div>
    `);
    timeline.appendChild(timelineItem);
  }
  this.container.appendChild(timeline);
};

Timeline.skeleton = function() {
  return dom.element(`
<div style="position: relative; width: 100%;">
  <div
      style="border-right: 2px solid rgb(170, 170, 170); height: 100%; left: 16px; position: absolute; top: 0px;"></div>
  <ul style="list-style-type: none; margin: 0px; padding: 0px;">
    <li style="margin-bottom: 8px;">
      <div style="align-items: center; display: flex; margin-bottom: 4px;">
        <div style="background-color: rgb(170, 170, 170); border-radius: 9999px; height: 32px; width: 32px;"></div>
        <div style="flex: 1 1 0%; margin-left: 16px;">
          <div style="width: 80%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </div>
        </div>
      </div>
      <div style="margin-left: 48px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
        </div>
      </div>
    </li>
    <li style="margin-bottom: 8px;">
      <div style="align-items: center; display: flex; margin-bottom: 4px;">
        <div style="background-color: rgb(170, 170, 170); border-radius: 9999px; height: 32px; width: 32px;"></div>
        <div style="flex: 1 1 0%; margin-left: 16px;">
          <div style="width: 60%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </div>
        </div>
      </div>
      <div style="margin-left: 48px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
        </div>
      </div>
    </li>
    <li style="margin-bottom: 8px;">
      <div style="align-items: center; display: flex; margin-bottom: 4px;">
        <div style="background-color: rgb(170, 170, 170); border-radius: 9999px; height: 32px; width: 32px;"></div>
        <div style="flex: 1 1 0%; margin-left: 16px;">
          <div style="width: 60%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
          </div>
        </div>
      </div>
      <div style="margin-left: 48px;">
        <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
          <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
            <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 2px; width: 100%;"></div>
          </div>
        </div>
      </div>
    </li>
  </ul>
</div>
  `);
}