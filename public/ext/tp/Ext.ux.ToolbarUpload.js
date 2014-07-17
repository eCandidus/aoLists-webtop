// vim: ts=4:sw=4:nu:fdc=4:nospell
/**
 * Ext.ux.form.ToolbarUpload
 *
 * @author  Jose E. Gonzalez jr
 * @author  Ing. Jozef Sakáloš (UploadPanel)
 * @date    2014-06-17
 *
 * @license Ext.ux.form.ToolbarUpload is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * License details: http://www.gnu.org/licenses/lgpl.html
 */
/*global Ext */
/**
 * @class Ext.ux.ToolbarUpload
 * @extends Ext.Panel
 */
Ext.ux.ToolbarUpload = Ext.extend(Ext.Toolbar, {

    // configuration options overridable from outside
    /**
     * @cfg {String} emptyString text to use when there is no file
     */
    emptyString: 'No file selected'

    // configuration options overridable from outside
    /**
     * @cfg {String} addIconCls icon class for add (file browse) button
     */
    ,
    addIconCls: 'icon-plus'

    /**
     * @cfg {String} addText Text on Add button
     */
    ,
    addText: 'Add'

    /**
     * @cfg {String} addText Text on Add button
     */
    ,
    addIconTooltip: ''

    /**
     * @cfg {Boolean} enableProgress true to enable querying server for progress information
     * Passed to underlying uploader. Included here for convenience.
     */
    ,
    enableProgress: true

    /**
     * @cfg {String} errorText
     */
    ,
    errorText: 'Error'

    /**
     * @cfg {String} fileCls class prefix to use for file type classes
     */
    ,
    fileCls: 'file'

    /**
     * @cfg {Number} maxFileSize Maximum upload file size in bytes
     * This config property is propagated down to uploader for convenience
     * Was 524288
     */
    ,
    maxFileSize: 2 * 1024 * 1024

    /**
     * @cfg {Number} Maximum file name length for short file names
     */
    ,
    maxLength: 18

    /**
     * @cfg {String/Ext.XTemplate} tpl Template for DataView.
     */

    /**
     * @cfg {String} uploadIconCls icon class to use for upload button
     */
    ,
    uploadIconCls: 'icon-upload'

    // overrides
    ,
    initComponent: function () {

        // create buttons
        // add (file browse button) configuration
        this.addBtn = new Ext.ux.form.BrowseButton({
            iconCls: this.addIconCls,
            scope: this,
            handler: this.onAddFile,
            tooltip: this.addIconTooltip
        });

        // upload button configuration
        this.uploadBtn = new Ext.Toolbar.Button({
            iconCls: this.uploadIconCls,
            scope: this,
            handler: this.onUpload,
            disabled: true,
            cls: 'x-btn-icon',
            tooltip: 'Click to upload'
        });

        // create view
        this.view = new Ext.Toolbar.TextItem({
            width: 50,
            text: this.emptyString
        });

        Ext.apply(this, {
            layout: 'border',
            items: [this.addBtn, this.view, this.uploadBtn]
        });

        // call parent
        Ext.ux.ToolbarUpload.superclass.initComponent.apply(this, arguments);

        // create uploader
        var config = {
            maxFileSize: this.maxFileSize,
            enableProgress: this.enableProgress,
            url: this.url,
            path: this.path
                // ADDED BY ECANDIDUS
                ,
            objid: this.objid
                // END
        };
        if (this.baseParams) {
            config.baseParams = this.baseParams;
        }
        this.uploader = new Ext.ux.FileUploader(config);

        // relay uploader events
        this.relayEvents(this.uploader, [
            'beforeallstart', 'allfinished', 'progress'
        ]);

        // install event handlers
        this.on({
            beforeallstart: {
                scope: this,
                fn: function () {
                    this.uploading = true;
                    this.updateButtons();
                }
            },
            allfinished: {
                scope: this,
                fn: function () {
                    this.uploading = false;
                    this.updateButtons();
                    if (this.handler) {
                        this.handler(this);
                    }
                }
            },
            progress: {
                fn: this.onProgress.createDelegate(this)
            }
        });
    }

    /**
     * get file name
     * @private
     * @param {Ext.Element} inp Input element containing the full file path
     * @return {String}
     */
    ,
    getFileName: function (inp) {
        return inp.getValue().split(/[\/\\]/).pop();
    }

    /**
     * get file path (excluding the file name)
     * @private
     * @param {Ext.Element} inp Input element containing the full file path
     * @return {String}
     */
    ,
    getFilePath: function (inp) {
        return inp.getValue().replace(/[^\/\\]+$/, '');
    }

    /**
     * returns file class based on name extension
     * @private
     * @param {String} name File name to get class of
     * @return {String} class to use for file type icon
     */
    ,
    getFileCls: function (name) {
        var atmp = name.split('.');
        if (1 === atmp.length) {
            return this.fileCls;
        } else {
            return this.fileCls + '-' + atmp.pop().toLowerCase();
        }
    }

    /**
     * called when file is added - adds file to store
     * @private
     * @param {Ext.ux.BrowseButton}
     */
    ,
    onAddFile: function (bb) {
        var inp = bb.detachInputFile();
        inp.addClass('x-hidden');
        var fileName = this.getFileName(inp);

        // Show
        this.view.setValue(Ext.util.Format.ellipsis(fileName, this.maxLength));
        // Save
        this.setPath(fileName);
        this.uploader.clearStore();
        this.uploader.addToStore(inp.id, {
            input: inp,
            fileName: fileName,
            filePath: this.getFilePath(inp),
            shortName: Ext.util.Format.ellipsis(fileName, this.maxLength),
            fileCls: this.getFileCls(fileName),
            state: 'queued'
        });

        this.uploadBtn.enable();
    }

    /**
     * destroys child components
     * @private
     */
    ,
    onDestroy: function () {

        // destroy uploader
        if (this.uploader) {
            this.uploader.stopAll();
            this.uploader.purgeListeners();
            this.uploader = null;
        }

    }

    /**
     * progress event handler
     * @private
     * @param {Ext.ux.FUploader} uploader
     * @param {Object} data progress data
     * @param {Ext.data.Record} record
     */
    ,
    onProgress: function (uploader, data, record) {
        var bytesTotal, bytesUploaded, pctComplete, state, idx, item, width, pgWidth;
        if (record) {
            state = record.get('state');
            bytesTotal = record.get('bytesTotal') || 1;
            bytesUploaded = record.get('bytesUploaded') || 0;
            if ('uploading' === state) {
                pctComplete = Math.round(1000 * bytesUploaded / bytesTotal) / 10;
            } else if ('done' === state) {
                pctComplete = 100;
            } else {
                pctComplete = 0;
            }
            record.set('pctComplete', pctComplete);

            idx = this.store.indexOf(record);
            item = Ext.get(this.view.getNode(idx));
            if (item) {
                width = item.getWidth();
                item.applyStyles({
                    'background-position': width * pctComplete / 100 + 'px'
                });
            }
        }
    }

    ,
    stopAll: function () {
        this.uploader.stopAll();
    }

    /**
     * tells uploader to upload
     * @private
     */
    ,
    onUpload: function () {
        this.uploader.upload();
    }

    /**
     * url setter
     */
    ,
    setUrl: function (url) {
        this.url = url;
        this.uploader.setUrl(url);
    }

    /**
     * path setter
     */
    ,
    setPath: function (path) {
        this.uploader.setPath(path);
    }

    /**
     * Updates buttons states depending on uploading state
     * @private
     */
    ,
    updateButtons: function () {
        if (true === this.uploading) {
            this.addBtn.disable();
            this.uploadBtn.disable();
        } else {
            this.addBtn.enable();
            this.uploadBtn.enable();
        }
    }

});

// register xtype
Ext.reg('toolbarupload', Ext.ux.ToolbarUpload);