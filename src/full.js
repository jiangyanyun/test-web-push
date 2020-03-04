var popup = (function () {
    'use strict';
  
    var popup = {
     a:1
  
    };
  
    popup._ = {
      /**
       * 处理事件监听
       * @param {*} element 
       * @param {*} type 
       * @param {*} handler 
       */
      addEvent: function(element, type, handler) {
        if (element && element.addEventListener) {
          element.addEventListener(
            type,
            function(e) {
              handler.call(this, e);
            },
            false
          );
        } else {
          var ontype = "on" + type;
          element[ontype] = function(e) {
            if (!e) {
              return undefined;
            }
            e.target = e.target || e.srcElement;
            handler.call(element, e);
          };
        }
      },
      getRgba: function(value) {
        if(typeof value !== "object") {
            return value;
        } 
        return  "rgba(" + value.r + "," + value.g + "," + value.b + "," + value.a + ")";
      },
      conversionNum: function(value) {
        if(!value){
          return
        }
  
        if (/^[0|1]?\.\d+$/.test(value)) {
          return Number(value) * 100 + "%";
        }
  
        var regVal = /^(-?\d+(\.\d+)?)px$/.exec(value);
        if (regVal) {
          return ((Number(regVal[1]) / 375) * window.screen.width).toFixed(2) + "px";
        }
  
        return value;
      },
      boxModel(type) {
        return function(val) {
          if (typeof val !== "object") {
            return val;
          }
          var str = "";
          for (var key in val) {
            str += type + "-" + key + ":" + popup._.conversionNum(val[key]) + ";";
          }
          return str;
        };
      }
  
  
      
    };
  
  
    var _ = popup._;
  
    /**
     * @file render.js
     * @date 2020/02/22
     * @description 根据配置渲染弹框
     */
  
    var NODE_NAME_MAP = {
      row: "div",
      column: "div",
      label: "p",
      image: "img",
      button: "button",
      link: "p",
      image_button:"img"
    };
  
    var NODE_STYLE_MAP= {
      textAlign: "text-align",
      lineHeight: "line-height",
      font: "font-size",
      backgroundColor: "background-color",
      borderWidth: "border-width",
      borderColor: "border-color",
      cornerRadius: "border-radius",
      backgroundImage: function(val) {
        return "background-image:url(" + val + ") no-repeat;";
      },
      margin: _.boxModel("margin"),
      padding: _.boxModel("padding")
    };
  
    /**
     * @constructor
     * @class
     * @param {Object} data 配置文件
     */
    function ElementRender(data) {
      this.properties = data.properties;
      this.template = data.template;
      this.maskEle = null;
      this.containerEle = null;
    }
  
    ElementRender.prototype = {
      constructor: ElementRender,
      render: function(callback) {
        // 创建遮罩层
        if (this.properties.maskColor) {
          this.maskEle = this.getElement({
            nodeName: "div",
            style: this.getStyle({
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              backgroundColor: _.getRgba(this.properties.maskColor),
              "z-index": 2147483646
            })
          });
          document.body.appendChild(this.maskEle);
        }
  
        //创建子元素
        this.template.isRoot = true;
        this.containerEle = this.createView(this.template);
        _.addEvent(this.containerEle, "click", function(e) {
          if (typeof callback === "function") {
            callback(e);
          }
        });
  
        
        // 遮罩层绑定点击事件
        if(this.properties.maskCloseEnabled){
            var _that = this;
            _.addEvent(this.maskEle, "click", function(e) {
                _that.destory();
            });
        }
  
        document.body.appendChild(this.containerEle);
      },
      getElement: function(obj) {
        var nodeName = obj.nodeName || "div";
        var style = obj.style;
        var attr = obj.attr;
        var child = obj.child;
        var action = obj.action;
        var ele = document.createElement(nodeName);
  
        if (style) {
          ele.style = style;
        }
  
        if (attr) {
          for (var key in attr) {
            if (attr[key]) {
              ele[key] = attr[key];
            }
          }
        }
  
        if (child && child.length) {
          for (var i = 0; i < child.length; i++) {
            child[i] ? ele.appendChild(child[i]) : null;
          }
        }
  
        if (action && action.length) {
          ele.setAttribute("data-action", JSON.stringify(action));
        }
  
        return ele;
      },
      getStyle: function(style) {
        var styleStr = "";
  
        for (var key in style) {
          var value = _.conversionNum(style[key]);
          var keyMap = NODE_STYLE_MAP[key];
  
          if (typeof keyMap === "string") {
            styleStr += keyMap + ":" + _.getRgba(value) + ";";
          } else if (typeof keyMap === "function") {
            styleStr += keyMap(style[key]) + ";";
          } else {
            styleStr += key + ":" + _.getRgba(value) + ";";
          }
        }
        return styleStr;
      },
      createView: function(template) {
        var child = [];
        var style = {
            "box-sizing": "border-box",
            display: "block",
        };
        var attr = {};
        var nodeName = NODE_NAME_MAP[template.type] || null;
        var align = template.layout.align || null;
  
        if(template.properties){
            if(template.properties.isHidden){
                return;
            }
            if (template.properties.text) {
                attr.innerText = template.properties.text;
            } else if (template.properties.image) {
                attr.src = template.properties.image;
            }
        }
  
        if (template.isRoot) {
          style["z-index"] = 2147483647;
        }
  
        // row类型使用横排布局
        if (template.type === "row") {
            style.display = "flex";
        }
  
        // link类型增加下划线
        if (template.type === "link") {
            style["text-decoration"]= "underline";
        }
  
        // 去除button的外边框
        if (nodeName === "button") {
            style.outline = "none";
        }
  
        var styleObj = Object.assign(
          {},
          style,
          template.layout,
          template.properties
        );
  
        var deleteProps=['image','text','name','isHidden','align'];
        for(var i=0; i<deleteProps.length; i++){
            delete styleObj[deleteProps[i]];
        }
  
        // 创建子元素
        if (template.subviews && template.subviews.length > 0) {
          // 有子元素，设置父元素触发BFC,解决margin重叠的问题  
          styleObj.overflow = "hidden"; 
          for (var i = 0; i < template.subviews.length; i++) {
            child.push(this.createView(template.subviews[i]));
          }
        }
  
        var element = this.getElement({
          nodeName: nodeName,
          attr: attr,
          style: this.getStyle(styleObj),
          child: child,
          action: template.action
        });
        
        // 对其方式使用flex布局处理
        if(align){
            var alignMap={
               "center":"center",
               "left":"flex-start",
               "right":"flex-end"
            };
            var container = document.createElement("div");
            container.style = "display:flex;  justify-content:"+ alignMap[align] + ";";
            container.appendChild(element);
            return container;
        }
  
        return element;
      },
      destory: function() {
        document.body.removeChild(this.maskEle);
        document.body.removeChild(this.containerEle);
      }
    };
  
    var template=[
      {
        "id": "V0101",
        "cname": "仅图片",
        "properties": {
          "maskColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.5
          },
          "maskCloseEnabled": true
        },
        "template": {
          "type": "column",
          "layout": {
            "align": "center",
            "width": "287px",
            "margin": {
              "top": "100px"
            }
          },
          "subviews": [
            {
              "type": "image_button",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3FOztI.png"
              },
              "layout": {
                "width": "32px",
                "height": "32px",
                "align": "right"
              },
              "action": {
                "id": "id001",
                "type": "close"
              }
            },
            {
              "type": "column",
              "layout": {
                "width": "287px",
                "margin": {
                }
              },
              "subviews": [
                {
                  "type": "image_button",
                  "properties": {
                    "image": "https://s2.ax1x.com/2020/02/18/3FOsf0.png",
                    "cornerRadius": "5px"
                  },
                  "layout": {
                    "align": "center",
                    "width": "287px",
                    "height": "382px",
                    "margin": {
                      "top": "20px"
                    }
                  }
                }
              ]
            },
            {
              "type": "image_button",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3FOztI.png",
                "isHidden": true
              },
              "layout": {
                "width": "32px",
                "height": "32px",
                "align": "center",
                "margin": {
                  "top": "20px"
                }
              },
              "action": {
                "id": "id002",
                "type": "close"
              }
            }
          ]
        }
      },
      {
        "id": "V0102",
        "cname": "图片 & 1 个按钮",
        "properties": {
          "closeEnabled": true,
          "closeStyle": {
            "image": "https://s2.ax1x.com/2020/02/18/3FOztI.png",
            "width": "32px",
            "height": "32px"
          },
          "maskColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.45
          },
          "maskCloseEnabled": false
        },
        "template": {
          "type": "column",
          "layout": {
            "width": "320px",
            "align": "center",
            "margin": {
              "top": "100px"
            }
          },
          "subviews": [
            {
              "type": "image",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3FOztI.png",
                "isHidden": true
              },
              "layout": {
                "width": "32px",
                "height": "32px",
                "align": "right"
              },
              "action": {
                "id": "id001",
                "type": "close"
              }
            },
            {
              "type": "column",
              "properties": {
                "backgroundColor": {
                  "r": 255,
                  "g": 255,
                  "b": 255,
                  "a": 1
                },
                "cornerRadius": "5px",
                "borderWidth": "0px"
              },
              "layout": {
                "align": "center",
                "width": "320px",
                "margin": {},
                "padding": {
                  "top": "20px",
                  "right": "20px",
                  "bottom": "20px",
                  "left": "20px"
                }
              },
              "subviews": [
                {
                  "type": "image",
                  "properties": {
                    "image": "https://s2.ax1x.com/2020/02/18/3kCdnP.jpg",
                    "cornerRadius": "120px"
                  },
                  "layout": {
                    "align": "center",
                    "width": "200px",
                    "height": "200px"
                  }
                },
                {
                  "type": "label",
                  "properties": {
                    "text": "恭喜获得大礼包",
                    "font": "24px",
                    "color": {
                      "r": 255,
                      "g": 0,
                      "b": 0,
                      "a": 1
                    },
                    "textAlign": "center"
                  },
                  "layout": {
                    "width": "200px",
                    "align": "center",
                    "margin": {
                      "top": "20px"
                    }
                  }
                },
                {
                  "type": "label",
                  "properties": {
                    "text": "点击下方 “领取大礼包” 立即领取",
                    "font": "14px",
                    "color": {
                      "r": 0,
                      "g": 0,
                      "b": 255,
                      "a": 1
                    },
                    "backgroundColor": {
                      "r": 239,
                      "g": 239,
                      "b": 239,
                      "a": 1
                    },
                    "lineHeight": "24px",
                    "textAlign": "center"
                  },
                  "layout": {
                    "margin": {
                      "top": "20px"
                    },
                    "padding": {
                      "top": "8px",
                      "right": "8px",
                      "bottom": "8px",
                      "left": "8px"
                    }
                  }
                },
                {
                  "type": "button",
                  "properties": {
                    "text": "领取大礼包",
                    "font": "18px",
                    "color": {
                      "r": 0,
                      "g": 0,
                      "b": 0,
                      "a": 0.3
                    },
                    "backgroundColor": {
                      "r": 249,
                      "g": 200,
                      "b": 35,
                      "a": 1
                    },
                    "borderColor": {
                      "r": 229,
                      "g": 179,
                      "b": 13,
                      "a": 1
                    },
                    "borderWidth": "2px",
                    "cornerRadius": "5px"
                  },
                  "layout": {
                    "align": "center",
                    "width": "150px",
                    "height": "48px",
                    "margin": {
                      "top": "20px"
                    }
                  }
                }
              ]
            },
            {
              "type": "image",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3FOztI.png"
              },
              "layout": {
                "width": "32px",
                "height": "32px",
                "align": "center",
                "margin": {
                  "top": "20px"
                }
              },
              "action": {
                "id": "id002",
                "type": "close"
              }
            }
          ]
        }
      },
      {
        "id": "V0103",
        "cname": "文字 & 1 个按钮",
        "properties": {
          "closeEnabled": false,
          "maskColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.5
          },
          "maskCloseEnabled": true
        },
        "template": {
          "type": "column",
          "properties": {
            "backgroundColor": {
              "r": 255,
              "g": 255,
              "b": 255,
              "a": 1
            },
            "cornerRadius": "20px",
            "borderWidth": "0px"
          },
          "layout": {
            "align": "center",
            "width": "320px",
            "margin": {
              "top": "240px"
            },
            "padding": {
              "top": "20px",
              "right": "20px",
              "bottom": "20px",
              "left": "20px"
            }
          },
          "subviews": [
            {
              "type": "label",
              "properties": {
                "text": "这是一个标题",
                "font": "24px",
                "color": {
                  "r": 255,
                  "g": 0,
                  "b": 0,
                  "a": 1
                }
              },
              "layout": {
                "width": "200px"
              }
            },
            {
              "type": "label",
              "properties": {
                "text": "这里是一大段文字，巴拉巴拉，这里是一大段文字，巴拉巴拉，这里是一大段文字，巴拉巴拉，这里是一大段文字，巴拉巴拉",
                "font": "18px",
                "cornerRadius": "5px",
                "lineHeight": "28px"
              },
              "layout": {
                "width": "280px",
                "margin": {
                  "top": "15px"
                }
              }
            },
            {
              "type": "button",
              "properties": {
                "text": "点击查看详情",
                "font": "18px",
                "color": {
                  "r": 255,
                  "g": 255,
                  "b": 255,
                  "a": 1
                },
                "backgroundColor": {
                  "r": 4,
                  "g": 203,
                  "b": 148,
                  "a": 1
                },
                "borderWidth": "0px",
                "cornerRadius": "24px"
              },
              "layout": {
                "align": "center",
                "width": "150px",
                "height": "48px",
                "margin": {
                  "top": "20px"
                }
              }
            }
          ]
        }
      },
      {
        "id": "V0104",
        "cname": "图片 & 2 个按钮",
        "properties": {
          "maskColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.75
          },
          "maskCloseEnabled": false
        },
        "template": {
          "type": "column",
          "properties": {
            "backgroundColor": {
              "r": 255,
              "g": 255,
              "b": 255,
              "a": 1
            },
            "cornerRadius": "5px",
            "borderWidth": "0px"
          },
          "layout": {
            "align": "center",
            "width": "320px",
            "margin": {
              "top": "150px"
            },
            "padding": {
              "top": "20px",
              "right": "20px",
              "bottom": "20px",
              "left": "20px"
            }
          },
          "subviews": [
            {
              "type": "image",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3kCdnP.jpg",
                "cornerRadius": "120px"
              },
              "layout": {
                "align": "center",
                "width": "240px",
                "height": "240px"
              }
            },
            {
              "type": "label",
              "properties": {
                "text": "恭喜获得大礼包",
                "font": "24px",
                "color": {
                  "r": 255,
                  "g": 0,
                  "b": 0,
                  "a": 1
                },
                "textAlign": "center"
              },
              "layout": {
                "width": "285px",
                "margin": {
                  "top": "20px"
                }
              }
            },
            {
              "type": "label",
              "properties": {
                "text": "点击按钮立即领取",
                "font": "18px",
                "color": {
                  "r": 249,
                  "g": 200,
                  "b": 35,
                  "a": 1
                },
                "lineHeight": "32px",
                "textAlign": "center"
              },
              "layout": {
                "width": "285px",
                "margin": {
                  "top": "20px"
                }
              }
            },
            {
              "type": "row",
              "layout": {
                "align": "center",
                "margin": {
                  "top": "20px"
                }
              },
              "subviews": [
                {
                  "type": "button",
                  "properties": {
                    "text": "送我都不要",
                    "font": "18px",
                    "color": {
                      "r": 0,
                      "g": 0,
                      "b": 0,
                      "a": 0.3
                    },
                    "backgroundColor": {
                      "r": 249,
                      "g": 200,
                      "b": 35,
                      "a": 1
                    },
                    "borderColor": {
                      "r": 229,
                      "g": 179,
                      "b": 13,
                      "a": 1
                    },
                    "borderWidth": "1px",
                    "cornerRadius": "5px"
                  },
                  "layout": {
                    "width": "120px",
                    "height": "48px"
                  }
                },
                {
                  "type": "button",
                  "properties": {
                    "text": "领取大礼包",
                    "font": "18px",
                    "color": {
                      "r": 0,
                      "g": 0,
                      "b": 0,
                      "a": 0.3
                    },
                    "backgroundColor": {
                      "r": 249,
                      "g": 200,
                      "b": 35,
                      "a": 1
                    },
                    "borderColor": {
                      "r": 229,
                      "g": 179,
                      "b": 13,
                      "a": 1
                    },
                    "borderWidth": "1px",
                    "cornerRadius": "5px"
                  },
                  "layout": {
                    "width": "140px",
                    "height": "48px",
                    "margin": {
                      "left": "20px"
                    }
                  }
                }
              ]
            }
          ]
        }
      },
      {
        "id": "V0105",
        "cname": "图片 & 2 个按钮",
        "properties": {
          "maskColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0.75
          },
          "maskCloseEnabled": true
        },
        "template": {
          "type": "column",
          "properties": {
            "backgroundColor": {
              "r": 255,
              "g": 255,
              "b": 255,
              "a": 1
            },
            "cornerRadius": "5px",
            "borderWidth": "0px"
          },
          "layout": {
            "align": "center",
            "width": "320px",
            "margin": {
              "top": "150px"
            },
            "padding": {
              "top": "20px",
              "right": "20px",
              "bottom": "20px",
              "left": "20px"
            }
          },
          "subviews": [
            {
              "type": "image",
              "properties": {
                "image": "https://s2.ax1x.com/2020/02/18/3kCdnP.jpg",
                "cornerRadius": "120px"
              },
              "layout": {
                "align": "center",
                "width": "200px",
                "height": "200px"
              }
            },
            {
              "type": "label",
              "properties": {
                "text": "恭喜获得大礼包",
                "font": "24px",
                "color": {
                  "r": 255,
                  "g": 0,
                  "b": 0,
                  "a": 1
                },
                "textAlign": "center"
              },
              "layout": {
                "align": "center",
                "width": "285px",
                "margin": {
                  "top": "20px"
                }
              }
            },
            {
              "type": "label",
              "properties": {
                "text": "点击按钮立即领取",
                "font": "18px",
                "color": {
                  "r": 249,
                  "g": 200,
                  "b": 35,
                  "a": 1
                },
                "lineHeight": "32px",
                "textAlign": "center"
              },
              "layout": {
                "align": "center",
                "width": "285px",
                "margin": {
                  "top": "20px"
                }
              }
            },
            {
              "type": "button",
              "properties": {
                "text": "立即领取",
                "font": "18px",
                "color": {
                  "r": 0,
                  "g": 0,
                  "b": 0,
                  "a": 0.3
                },
                "backgroundColor": {
                  "r": 249,
                  "g": 200,
                  "b": 35,
                  "a": 1
                },
                "borderColor": {
                  "r": 229,
                  "g": 179,
                  "b": 13,
                  "a": 1
                },
                "borderWidth": "1px",
                "cornerRadius": "5px"
              },
              "layout": {
                "width": "150px",
                "height": "48px",
                "align": "center",
                "margin": {
                  "top": "20px"
                }
              }
            },
            {
              "type": "link",
              "properties": {
                "text": "查看详细说明和解释",
                "font": "14px",
                "color": {
                  "r": 0,
                  "g": 0,
                  "b": 255,
                  "a": 1
                }
              },
              "layout": {
                "width": "285px",
                "textAlign": "center",
                "margin": {
                  "top": "20px"
                }
              }
            }
          ]
        }
      }
    ];
  
    // 渲染弹框
    var ele = new ElementRender(template[1]);
    // 处理弹框的点击操作
    ele.render(function(e){
      /**@type {HTMLElement} **/
      var action = e.target.getAttribute('data-action');
      if(!action){
        return
      }
      action = JSON.parse(action);
      for(var i=0;i<action.length;i++){
        var item = action[i];
        if(item.type === 'openlink' && item.value){
           window.location.href = item.value;
        }else if(item.type === 'close'){
          ele.destory();
        }else if(item.type === 'customize');
      }
    }); 
  
  
    popup.getConfigFromServer = function(){
  
    };
  
    popup.getLocalStorage = function(){
  
    };
  
    return popup;
  
  }());
  