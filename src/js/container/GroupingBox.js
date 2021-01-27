
function GroupingBox(opt) {
  this.groups = opt.groups;
}

GroupingBox.AVATAR = `
  <div class="row mb-3" style="justify-content: center; background: #7aa6da; margin-right: -20px; margin-left: -20px;">
    <div class="avatar avatar-128">
      <img src="img/avatars/5.jpg">
    </div>
  </div>
`;

GroupingBox.TITLED_ITEM = `
  <div>
    <div class="title-bordered mb-2">
      <strong></strong>
    </div>
    <div class="mb-3">
    </div>
  </div>
`;

GroupingBox.prototype.render = function(containerId, params) {
  let container = dom.find(containerId);
  for (let i = 0; i < this.groups.length; i++) {
    let group = this.groups[i];
    if (group.type === 'avatar') {
      let elAvatar = dom.element(GroupingBox.AVATAR);
      container.appendChild(elAvatar);
    } else if (group.type == 'list') {

    } else if (group.type == 'list') {

    } else {
      let elTitledItem = dom.element(GroupingBox.TITLED_ITEM);
      let elStrong = dom.find('strong', elTitledItem);
      elStrong.innerHTML = group.title;
      let elDiv = dom.find('div.mb-3', elTitledItem);
      xhr.post({
        url: group.url,
        data: params,
        success: function(resp) {
          // TODO
          group.render(elDiv, resp.data);
        }
      });
      container.appendChild(elTitledItem);
    }
  }
};

GroupingBox.skeleton = function() {
  return dom.element(`
<div style="width: 100%;">
  <div style="margin: 0px auto; padding-bottom: 24px; width: 200px;">
    <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 40%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: rgba(0, 0, 0, 0.3) transparent transparent; border-style: solid; border-width: 8px 8px 0px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: none; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 80%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: transparent transparent rgba(0, 0, 0, 0.3); border-style: solid; border-width: 0px 8px 8px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: block; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 30%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
  <div style="border-bottom: 1px solid rgba(0, 0, 0, 0.3);">
    <div
        style="align-items: center; cursor: pointer; display: flex; justify-content: space-between; padding: 16px 0px;">
      <div style="width: 60%;">
        <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 2px; height: 8px; width: 100%;"></div>
      </div>
      <div
          style="border-color: rgba(0, 0, 0, 0.3) transparent transparent; border-style: solid; border-width: 8px 8px 0px; height: 0px; width: 0px;"></div>
    </div>
    <div style="display: none; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: start; width: 100%;">
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 20%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 50%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 40%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
        <div style="margin-bottom: 8px; margin-right: 8px; width: 10%;">
          <div style="background-color: rgba(0, 0, 0, 0.3); border-radius: 9999px; height: 4px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </div>
</div>
  `);
};