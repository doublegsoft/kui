/**
 *
 * @param opt
 *
 * @constructor
 */
function Members(opt) {
  this.members = opt.members;
  this.onMemberClicked = opt.onMemberClicked;
  this.model = opt.model;
}

Members.prototype.renderTo = function (container) {
  // make container empty
  container.innerHTML = '';

  let model = this.model;
  let htmlMembers = `
    <div class="row m-auto" style="justify-content: center;">
      <style>
      .tooltip-avatar {

      }
      .tooltip-text {
        visibility: hidden;
        min-width: 56px;
        background-color: #666666;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        font-size: 12px;
        padding: 2px 0;
        position: absolute;
        z-index: 1;
        opacity: 1;
        top: 25px;
        left: 20px;
      }
      .tooltip-avatar:hover .tooltip-text {
        visibility: visible;
      }
      </style>
    </div>
  `;

  let elMembers = dom.element(htmlMembers);
  for (let i = 0; i < this.members.length; i++) {
    let member = this.members[i];
    if (typeof member.fnAvatar !== 'function') {
      member.fnAvatar = function () {
        return member.avatar;
      };
    }
    if (typeof member.fnName !== 'function') {
      member.fnName = function () {
        return member.name;
      };
    }
    let htmlMember = `
      <div class="avatar avatar-36 tooltip-avatar">
        <img src="${member.fnAvatar()}">
        <span class="tooltip-text">${member.fnName()}</span>
      </div>
    `;
    let elMember = dom.element(htmlMember);
    if (this.onMemberClicked) {
      dom.model(elMember, member);
      elMember.classList.add('pointer');
      dom.bind(elMember, 'click', (event) => {
        let member = dom.model(event.target);
        this.onMemberClicked(member);
      });
    }
    elMembers.appendChild(elMember);
  }
  container.appendChild(elMembers);
};