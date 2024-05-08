
class Block {
    constructor() {
        this.socket = io();
        this.selectedMaterial = '/static/images/bricks.jpg';
        this.$container = $('#bricks_container');
        this.currentUser = null;
        this.buttonIds = ['#brick', '#grass', '#grovel'];
        this.selectedMap = {
            '#brick': '/static/images/bricks.jpg',
            '#grass': '/static/images/grass.jpg',
            '#grovel': '/static/images/gravel.jpg'
        };
        this.$container
        this.clickButtons();
        this.clickForm();
        this.clearCanvass();
        this.createBlocks();
        this.listenSocket();
    }

    clickButtons() {
        this.buttonIds.forEach(buttonId => {
            $(buttonId).click(() => {
                this.selectedMaterial = this.selectedMap[buttonId];
            });
        });
    }

    clickForm() {
        $('#login_form').submit((event) => {
            event.preventDefault();
            const name = $('#name').val().trim();
            if (name) {
                this.socket.emit('newUser', name);
                this.currentUser = name;
            }
        });
    }

    clearCanvass(){
        $('#clear').click(() => {
            this.socket.emit('clear');
        });
    }

    createBlocks(){
        this.$container.click((event) => {
            const radius = 20;
            const left = event.pageX - this.$container.offset().left - radius;
            const top = event.pageY - this.$container.offset().top - radius;

            const $createBlock = $('<div>').addClass('block').css({
                background: `url(${this.selectedMaterial})`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                left: `${left}px`,
                top: `${top}px`,
            });

            const serializedBlock = {
                html: $createBlock.prop('outerHTML'),
                position: { left, top },
                username: this.currentUser
            };

            this.socket.emit('createBlock', serializedBlock);
        });
    }

    listenSocket() {
        this.socket.on('lognewUser', (name) => {
            console.log('Message from server:', name);
            $('#joiners').append(`<li>${name}</li>`);
        });

        this.socket.on('loggedUsers', (users) => {
            console.log('Logged in users:', users);
            $('#login_form').css('display', 'none');
            $('#playroom').css('display', 'block');
            users.forEach((user) => {
                $('#joiners').append(`<li>${user}</li>`);
            });
        });

        this.socket.on('drawBlock', (data) => {
            const $createBlock = $(data.html);
            this.$container.append($createBlock);
        });

        this.socket.on('clearContent', () => {
            this.$container.empty();
        });
    }
}

$(document).ready(() => {
    new Block();
});
