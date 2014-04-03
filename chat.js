Ext.ns('Chat');

Chat.Util = {

    getUserLinkForId : function(userId) {
        var selector = "tab::" + userId;
        console.log(selector);
        return Ext.get(selector);
    },

    notifyNewMessage : function(userIdForTab) {
        // console.log("notifyNewMessage");
        var userTab = this.getUserLinkForId(userIdForTab);
        console.dir(userTab);
        userTab.setStyle('color', 'red');
        // TODO
        // create text color animation style class
        // add the class to the item.
    },

    readMessages : function(userIdForTab) {
        // console.log("readMessages");
        var userTab = this.getUserLinkForId(userIdForTab);
        console.dir(userTab);
        userTab.setStyle('color', 'blue');
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

    setTabTitleColor : function( userIdForTab, newColor ) {
        var tabId = "tab::"+userIdForTab;
        tabPanel  = chatWindow.items.itemAt(1);
        console.log("tabPanel:")
        console.dir(tabPanel);
        var tabNo = 0;
        // TODO buggy find() funtion
        tabPanel.items.find(function(tab) {
            if(tab.id === tabId) {
                return tabNo;
            } else {
                tabNo++;
            }
        });
        console.log("tabNo" + tabNo);
        // make sure we have a number and tab exists
        if( tabNo>=0 && !Ext.isEmpty( tabPanel.getTabEl(tabNo))) {
            var t = tabPanel.getTabEl(tabNo);
            var tt = Ext.getDom(t);
            tt.getElementsByClassName("x-tab-strip-text")[0].style.backgroundColor = newColor;
        }
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
        class:'userAvailble'
    }, {
        text: 'Ashiq',
        userId: "ashiq",
        class:'userBusy'
    }, {
        text: 'Hari Priya',
        userId: "haripriya",
        class:'userAvailble'
    }, {
        text: 'Prabhakar',
        userId: "prabhakar",
        class:'userAway'
    }],
    layout: 'fit',
    tpl: new Ext.XTemplate('<tpl for="links"><a class="userChatTabLink {class}" id="{userId}" href="#">{text}</a></tpl>'),
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
                                    Chat.Util.sendMessage(userId);
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
                            Chat.Util.sendMessage(userId);
                        }
                    }]
                    }]
                });
        }
        
        
        this.tabPanel.setActiveTab(tab);
        // TODO
        // if the tab is the currently focused tab, dont do readMessages()
        // Chat.Util.readMessages(userId);
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
