/* globals $ */

'use strict';

describe('CMS.Modal', function () {
    fixture.setBase('cms/tests/frontend/unit/fixtures');

    it('creates a Modal class when document is ready', function () {
        expect(CMS.Modal).toBeDefined();
    });

    it('has public API', function () {
        expect(CMS.Modal.prototype.open).toEqual(jasmine.any(Function));
        expect(CMS.Modal.prototype.close).toEqual(jasmine.any(Function));
        expect(CMS.Modal.prototype.minimize).toEqual(jasmine.any(Function));
        expect(CMS.Modal.prototype.maximize).toEqual(jasmine.any(Function));
    });

    describe('instance', function () {
        it('has ui', function (done) {
            $(function () {
                var modal = new CMS.Modal();
                expect(modal.ui).toEqual(jasmine.any(Object));
                expect(Object.keys(modal.ui)).toContain('modal');
                expect(Object.keys(modal.ui)).toContain('body');
                expect(Object.keys(modal.ui)).toContain('window');
                expect(Object.keys(modal.ui)).toContain('toolbarLeftPart');
                expect(Object.keys(modal.ui)).toContain('minimizeButton');
                expect(Object.keys(modal.ui)).toContain('maximizeButton');
                expect(Object.keys(modal.ui)).toContain('title');
                expect(Object.keys(modal.ui)).toContain('titlePrefix');
                expect(Object.keys(modal.ui)).toContain('titleSuffix');
                expect(Object.keys(modal.ui)).toContain('resize');
                expect(Object.keys(modal.ui)).toContain('breadcrumb');
                expect(Object.keys(modal.ui)).toContain('closeAndCancel');
                expect(Object.keys(modal.ui)).toContain('modalButtons');
                expect(Object.keys(modal.ui)).toContain('modalBody');
                expect(Object.keys(modal.ui)).toContain('frame');
                expect(Object.keys(modal.ui)).toContain('shim');
                expect(Object.keys(modal.ui).length).toEqual(16);
                done();
            });
        });

        it('has options', function (done) {
            $(function () {
                var modal = new CMS.Modal();
                expect(modal.options).toEqual({
                    onClose: false,
                    minHeight: 400,
                    minWidth: 800,
                    modalDuration: 200,
                    newPlugin: false,
                    resizable: true,
                    maximizable: true,
                    minimizable: true
                });

                var modal2 = new CMS.Modal({ minHeight: 300, minWidth: 100 });
                expect(modal2.options).toEqual({
                    onClose: false,
                    minHeight: 300,
                    minWidth: 100,
                    modalDuration: 200,
                    newPlugin: false,
                    resizable: true,
                    maximizable: true,
                    minimizable: true
                });

                done();
            });
        });
    });

    describe('.open()', function () {
        beforeEach(function (done) {
            fixture.load('modal.html');
            CMS.API.Tooltip = {
                hide: jasmine.createSpy()
            };
            CMS.API.Toolbar = {
                showLoader: jasmine.createSpy()
            };
            $(function () {
                done();
            });
        });

        afterEach(function () {
            fixture.cleanup();
        });

        it('throws an error when no url or html options were passed', function () {
            var modal = new CMS.Modal();

            expect(modal.open.bind(modal, {})).toThrowError(
                Error, 'The arguments passed to "open" were invalid.'
            );
            expect(modal.open.bind(modal, { html: '' })).toThrowError(
                Error, 'The arguments passed to "open" were invalid.'
            );
            expect(modal.open.bind(modal, { url: '' })).toThrowError(
                Error, 'The arguments passed to "open" were invalid.'
            );
            expect(modal.open.bind(modal, { html: '<div></div>' })).not.toThrow();
            expect(modal.open.bind(modal, {
                url: '/base/cms/tests/frontend/unit/html/modal_iframe.html'
            })).not.toThrow();
        });

        it('does not open if there is a plugin creation in process', function () {
            var modal = new CMS.Modal();
            CMS._newPlugin = true;
            spyOn(modal, '_deletePlugin').and.callFake(function () {
                return false;
            });

            expect(modal.open({ html: '<div></div>' })).toEqual(false);
        });

        it('confirms if the user wants to remove freshly created plugin when opening new modal', function () {
            var modal = new CMS.Modal();
            spyOn(CMS.Navigation.prototype, 'initialize').and.callFake(function () {
                return {};
            });
            CMS.API.Toolbar = new CMS.Toolbar();
            CMS._newPlugin = {
                delete: '/delete-url',
                breadcrumb: [{ title: 'Fresh plugin' }]
            };

            CMS.config = $.extend(CMS.config, {
                csrf: 'custom-token',
                lang: {
                    confirmEmpty: 'Question about {1}?'
                }
            });

            spyOn(modal, '_deletePlugin').and.callThrough();
            jasmine.Ajax.install();
            spyOn(CMS.API.Toolbar, 'openAjax').and.callThrough();
            spyOn(CMS.API.Helpers, 'secureConfirm').and.callFake(function () {
                return false;
            });

            expect(modal.open({ html: '<div></div>' })).toEqual(false);
            expect(CMS.API.Toolbar.openAjax).toHaveBeenCalledWith({
                url: '/delete-url',
                post: '{ "csrfmiddlewaretoken": "custom-token" }',
                text: 'Question about Fresh plugin?',
                callback: jasmine.any(Function)
            });
            jasmine.Ajax.uninstall();
        });
    });
});
