Ext.ns('Chat');

Chat.Util = {

    getUserTabCmpForId : function(userId) {
        var selector = "tab::" + userId;
        console.log(selector);
        return Ext.get(selector);
    },

    getUserLinkCmpForId : function(userId) {
        var selector = "a.userChatTabLink#"+userId;
        return Ext.select(selector);
    },

    notifyNewMessage : function(userIdForTab) {
        // console.log("notifyNewMessage");
        var tabId = "tab::"+userIdForTab;
        if(!this.isTabActive(tabId)) {
            var newColor = "red";
            this.setTabTitleColor("tab::"+userIdForTab,newColor);
        }
    },

    readMessages : function(tabId) {
        console.log("readMessages for "+tabId);
        if(this.isTabActive(tabId)) {
            console.log(tabId + " is active");
            var newColor = "";
            this.setTabTitleColor(tabId,newColor);
        }
    },

    sendMessage : function(userId) {
        console.log("Msg sent to " + userId);
        var $textareaCmp = Ext.getCmp('textarea::' + userId);
        var $textfieldCmp = Ext.getCmp("textfield::" + userId);
        var currentText = $textareaCmp.getValue();
        var updatedText = ((currentText.length === 0) ? currentText: currentText + "\n") + $textfieldCmp.getValue();
        $textareaCmp.setValue(updatedText);
        this.updateChatVisibility(userId);
        $textfieldCmp.reset();
    },

    updateChatVisibility : function(userId) {
        var $textareaCmp = Ext.getCmp('textarea::' + userId).getEl();
        $textareaCmp.dom.scrollTop = 99999;
    },

    setTabTitleColor : function( tabId, newColor ) {
        tabPanel  = chatWindow.items.itemAt(1);
        var tabNo, count = 0;
        tabNo = tabPanel.items.findIndex('id',tabId);
        // make sure we have a number and tab exists
        if( tabNo>=0 && !Ext.isEmpty( tabPanel.getTabEl(tabNo))) {
            var t = tabPanel.getTabEl(tabNo);
            var tt = Ext.getDom(t);
            tt.getElementsByClassName("x-tab-strip-text")[0].style.backgroundColor = newColor;
        } else {
            console.log("cannot modify a tab that is not open!!");
            console.debug(tabId + "," + tabNo)
        }
    },

    isTabActive : function(tabId) {
        var tabPanel  = chatWindow.items.itemAt(1);
        var activeTabId ;
        try {
            activeTabId = tabPanel.getActiveTab().getId();
            console.log("activeTabId:"+activeTabId);
            console.log("current tabId:"+tabId);
        } catch (e) {
            console.log("cannot get active element when no tabs are open!");
        }
        return (tabId === activeTabId);
    },

    initiateNewChatNotification : function(userId) {
        var $userLinkCmp = this.getUserLinkCmpForId(userId);
        $userLinkCmp.addClass("newChatInitiation");
    }

};


// {{{
Chat.LinksPanel = Ext.extend(Ext.Panel, {

    // configurables
    border: false,
    cls: 'link-panel',
    tabBar: {
        //manual property
        docked: 'bottom',
        scrollable: 'horizontal'
    },
    links: [{
        //manual prop
        text: 'Vignesh',
        userId: 'vignesh',
        chatStatus:'userAvailable'
    }, {
        text: 'Ashiq',
        userId: "ashiq",
        chatStatus:'userBusy'
    }, {
        text: 'Hari Priya',
        userId: "haripriya",
        chatStatus:'userAvailable'
    }, {
        text: 'Prabhakar',
        userId: "prabhakar",
        chatStatus:'userAway'
    }],
    layout: 'fit',
    tpl: new Ext.XTemplate('<tpl for="links"><a class="userChatTabLink {chatStatus}" id="{userId}" href="#">{text}</a></tpl>'),
    // {{{
    afterRender: function() {
        console.log("LinksPanel is rendered..");
        // call parent (MANDATORY)
        Chat.LinksPanel.superclass.afterRender.apply(this, arguments);

        // create links (Otherwise the Panel will be empty)
        this.tpl.overwrite(this.body, {
            links: this.links
        });

    }
    // e/o function afterRender
    // }}}
    });
// e/o extend
// register xtype
Ext.reg('linkspanel', Chat.LinksPanel);
// }}}
// {{{
Chat.Window = Ext.extend(Ext.Window, {

    // configurables
    // anything what is here can be configured from outside
    layout: 'border'

    // {{{
    ,
    initComponent: function() {

        // hard coded config - cannot be changed from outside
        var config = {
            items: [{
                xtype: 'linkspanel',
                region: 'west',
                width: 150,
                collapsible: false,
                split: true
            }, {
                xtype: 'tabpanel',
                region: 'center',
                border: false,
                activeItem: 0,
                items: []
                }]
            };

        // apply config
        Ext.apply(this, Ext.apply(this.initialConfig, config));

        // call parent
        Chat.Window.superclass.initComponent.apply(this, arguments);

        this.linksPanel = this.items.itemAt(0);
        this.tabPanel = this.items.itemAt(1);

        this.linksPanel.on({
            scope: this,
            render: function() {
                this.linksPanel.body.on({
                    scope: this,
                    click: this.onLinkClick,
                    delegate: 'a.userChatTabLink',
                    stopEvent: true
                });
            }
        });
    }
    // e/o function initComponent
    // }}}
    // {{{
    ,
    onLinkClick: function(e, t) {
        // remove newChatInitiation class from the link if it is applied already
        Ext.get(t).removeClass("newChatInitiation");
        var title = t.innerHTML;
        var userId = t.id;
        
        // console.log("userId:"+userId);
        var tab = this.tabPanel.items.find(function(i) {
            return i.title === title;
        });
        if (!tab) {
            tab = this.tabPanel.add({
                title: title,
                id: "tab::"+userId,
                layout: 'fit',
                closable: true,
                listeners : {
                    render : function() {
                        console.log("added listener to tab "+this.id);
                        var tabId = this.getEl().id;
                        cmp = Ext.getCmp(tabId);
                        cmp.on("show",function(){ 
                            console.log(tabId + "is shown");
                            chatUtil.readMessages(tabId);
                        });
                    }
                },
                items: [{
                    xtype: 'panel',
                    id: 'panel::' + userId,
                    items: [{
                        xtype: 'textarea',
                        id: "textarea::" + userId,
                        readOnly: true,
                        width: "100%",
                        height: "70%",
                        emptyText: 'Your conversation with : ' + title
                    }, {
                        xtype: 'textfield',
                        width: "100%",
                        id: "textfield::" + userId,
                        emptyText: 'Type here to chat with :' + title,
                        listeners: {
                            specialkey: function(f, e) {
                                if (e.getKey() == e.ENTER) {
                                    chatUtil.sendMessage(userId);
                                }
                            }
                        }
                    }, {
                        xtype: 'button',
                        width: "20%",
                        id: "submitButton::" + userId,
                        text: 'submit',
                        handler: function(btn) {
                            var userId = btn.id.substring(btn.id.indexOf("::") + 2, btn.id.length);
                            chatUtil.sendMessage(userId);
                        }
                    }]
                    }]
                });
        }
        
        
        this.tabPanel.setActiveTab(tab);
        // TODO
        // if the tab is the currently focused tab, dont do readMessages()
        // chatUtil.readMessages(userId);
    }
    // eo function onLinkClick
    // }}}
    });
// e/o extend
// register xtype
Ext.reg('chatwindow', Chat.Window);
// }}}
Ext.BLANK_IMAGE_URL = 'ext/resources/images/default/s.gif';

// application main entry point
Ext.onReady(function() {

    Ext.QuickTips.init();

    chatUtil = Object.create(Chat.Util);
    // create and show window
    chatWindow = new Chat.Window({
        width: 600,
        height: 400,
        closable: false,
        title: Ext.fly('page-title').dom.innerHTML
    });
    chatWindow.show();

});
// eo function onReady
