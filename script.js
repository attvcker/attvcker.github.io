class WhookBuilder {
    constructor() {
        this.data = {
            content: '',
            username: '',
            avatar_url: '',
            embeds: [],
            components: []
        };
        
        this.currentEditingComponent = null;
        this.previewUpdateTimeout = null;
        this.lastPreviewData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updatePreview();
    }

    bindEvents() {
        document.getElementById('messageContent').addEventListener('input', (e) => {
            this.data.content = e.target.value;
            this.updateCharCounter(e.target, 'contentCounter');
            this.debouncedUpdatePreview();
        });

        document.getElementById('username').addEventListener('input', (e) => {
            this.data.username = e.target.value;
            this.debouncedUpdatePreview();
        });

        document.getElementById('avatarUrl').addEventListener('input', (e) => {
            this.data.avatar_url = e.target.value;
            this.debouncedUpdatePreview();
        });

        document.getElementById('addEmbed').addEventListener('click', () => {
            this.addEmbed();
        });

        document.getElementById('addButton').addEventListener('click', () => {
            this.addButton();
        });

        document.getElementById('addSelect').addEventListener('click', () => {
            this.addSelect();
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('importJson').addEventListener('click', () => {
            this.showImportModal();
        });

        document.getElementById('exportJson').addEventListener('click', () => {
            this.exportJson();
        });

        document.getElementById('closeImportModal').addEventListener('click', () => {
            this.hideImportModal();
        });

        document.getElementById('cancelImport').addEventListener('click', () => {
            this.hideImportModal();
        });

        document.getElementById('confirmImport').addEventListener('click', () => {
            this.importJson();
        });

        document.getElementById('closeActionModal').addEventListener('click', () => {
            this.hideActionModal();
        });

        document.getElementById('cancelAction').addEventListener('click', () => {
            this.hideActionModal();
        });

        document.getElementById('confirmAction').addEventListener('click', () => {
            this.saveAction();
        });

        document.getElementById('actionType').addEventListener('change', (e) => {
            this.updateActionParams(e.target.value);
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('show');
            }
        });
    }

    updateCharCounter(input, counterId) {
        const counter = document.getElementById(counterId);
        const current = input.value.length;
        const max = input.maxLength;
        counter.textContent = current;
        
        if (current > max * 0.9) {
            counter.style.color = 'var(--danger)';
        } else if (current > max * 0.7) {
            counter.style.color = 'var(--warning)';
        } else {
            counter.style.color = 'var(--text-muted)';
        }
    }

    addEmbed() {
        const embed = {
            title: '',
            description: '',
            color: 5865242,
            fields: [],
            thumbnail: { url: '' },
            image: { url: '' },
            footer: { text: '', icon_url: '' },
            author: { name: '', icon_url: '', url: '' },
            timestamp: null
        };

        this.data.embeds.push(embed);
        this.renderEmbeds();
        this.updatePreview();
    }

    renderEmbeds() {
        const container = document.getElementById('embedsContainer');
        container.innerHTML = '';

        this.data.embeds.forEach((embed, index) => {
            const embedDiv = document.createElement('div');
            embedDiv.className = 'embed-item';
            embedDiv.innerHTML = `
                <div class="embed-header" onclick="app.toggleEmbed(${index})">
                    <span><i class="fas fa-layer-group"></i> Эмбед ${index + 1}</span>
                    <div>
                        <button class="btn btn-small btn-danger" onclick="app.removeEmbed(${index}); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="embed-content" id="embed-${index}">
                    <div class="field-group">
                        <label>Заголовок</label>
                        <input type="text" value="${embed.title}" oninput="app.updateEmbed(${index}, 'title', this.value)" placeholder="Заголовок эмбеда">
                    </div>
                    <div class="field-group">
                        <label>Описание</label>
                        <textarea oninput="app.updateEmbed(${index}, 'description', this.value)" placeholder="Описание эмбеда">${embed.description}</textarea>
                    </div>
                    <div class="field-group">
                        <label>Цвет</label>
                        <div class="color-input">
                            <input type="color" class="color-picker" value="#${embed.color.toString(16).padStart(6, '0')}" onchange="app.updateEmbedColor(${index}, this.value)">
                            <input type="text" value="#${embed.color.toString(16).padStart(6, '0')}" onchange="app.updateEmbedColor(${index}, this.value)" placeholder="#5865f2">
                        </div>
                    </div>
                    <div class="field-row">
                        <div class="field-group">
                            <label>URL миниатюры</label>
                            <input type="text" value="${embed.thumbnail ? embed.thumbnail.url || '' : ''}" oninput="app.updateEmbed(${index}, 'thumbnail', {url: this.value})" placeholder="https://example.com/image.png">
                        </div>
                        <div class="field-group">
                            <label>URL изображения</label>
                            <input type="text" value="${embed.image ? embed.image.url || '' : ''}" oninput="app.updateEmbed(${index}, 'image', {url: this.value})" placeholder="https://example.com/image.png">
                        </div>
                    </div>
                    <div class="field-group">
                        <label>Автор</label>
                        <div class="field-row">
                            <input type="text" value="${embed.author ? embed.author.name || '' : ''}" oninput="app.updateEmbedAuthor(${index}, 'name', this.value)" placeholder="Имя автора">
                            <input type="text" value="${embed.author ? embed.author.icon_url || '' : ''}" oninput="app.updateEmbedAuthor(${index}, 'icon_url', this.value)" placeholder="URL иконки">
                        </div>
                        <input type="text" value="${embed.author ? embed.author.url || '' : ''}" oninput="app.updateEmbedAuthor(${index}, 'url', this.value)" placeholder="URL ссылки">
                    </div>
                    <div class="field-group">
                        <label>Подвал</label>
                        <div class="field-row">
                            <input type="text" value="${embed.footer ? embed.footer.text || '' : ''}" oninput="app.updateEmbedFooter(${index}, 'text', this.value)" placeholder="Текст подвала">
                            <input type="text" value="${embed.footer ? embed.footer.icon_url || '' : ''}" oninput="app.updateEmbedFooter(${index}, 'icon_url', this.value)" placeholder="URL иконки">
                        </div>
                    </div>
                    <div class="field-group">
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" ${embed.timestamp ? 'checked' : ''} onchange="app.updateEmbedTimestamp(${index}, this.checked)">
                            Показать время
                        </label>
                    </div>
                    <div class="field-group">
                        <label style="display: flex; justify-content: space-between; align-items: center;">
                            Поля
                            <button class="btn btn-small btn-secondary" onclick="app.addEmbedField(${index})">
                                <i class="fas fa-plus"></i> Добавить поле
                            </button>
                        </label>
                        <div id="fields-${index}">
                            ${this.renderEmbedFields(embed.fields, index)}
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(embedDiv);
        });
    }

    renderEmbedFields(fields, embedIndex) {
        return fields.map((field, fieldIndex) => `
            <div class="embed-field-item" style="background: var(--background); padding: 1rem; margin-bottom: 0.5rem; border-radius: 6px; border: 1px solid var(--border);">
                <div class="field-row">
                    <div class="field-group" style="margin: 0;">
                        <label>Название поля</label>
                        <input type="text" value="${field.name}" oninput="app.updateEmbedField(${embedIndex}, ${fieldIndex}, 'name', this.value)" placeholder="Название поля">
                    </div>
                    <div style="display: flex; align-items: end; gap: 0.5rem;">
                        <label style="display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                            <input type="checkbox" ${field.inline ? 'checked' : ''} onchange="app.updateEmbedField(${embedIndex}, ${fieldIndex}, 'inline', this.checked)">
                            В линию
                        </label>
                        <button class="btn btn-small btn-danger" onclick="app.removeEmbedField(${embedIndex}, ${fieldIndex})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="field-group" style="margin-top: 0.5rem; margin-bottom: 0;">
                    <label>Значение</label>
                    <textarea oninput="app.updateEmbedField(${embedIndex}, ${fieldIndex}, 'value', this.value)" placeholder="Значение поля" style="min-height: 80px;">${field.value}</textarea>
                </div>
            </div>
        `).join('');
    }

    toggleEmbed(index) {
        const content = document.getElementById(`embed-${index}`);
        content.classList.toggle('collapsed');
    }

    updateEmbed(index, property, value) {
        if (property === 'thumbnail' || property === 'image') {
            this.data.embeds[index][property] = value;
        } else {
            this.data.embeds[index][property] = value;
        }
        this.debouncedUpdatePreview();
    }

    updateEmbedColor(index, color) {
        const hex = color.replace('#', '');
        this.data.embeds[index].color = parseInt(hex, 16);
        this.debouncedUpdatePreview();
    }

    updateEmbedAuthor(index, property, value) {
        if (!this.data.embeds[index].author) {
            this.data.embeds[index].author = { name: '', icon_url: '', url: '' };
        }
        this.data.embeds[index].author[property] = value;
        this.debouncedUpdatePreview();
    }

    updateEmbedFooter(index, property, value) {
        if (!this.data.embeds[index].footer) {
            this.data.embeds[index].footer = { text: '', icon_url: '' };
        }
        this.data.embeds[index].footer[property] = value;
        this.debouncedUpdatePreview();
    }

    updateEmbedTimestamp(index, show) {
        this.data.embeds[index].timestamp = show ? new Date().toISOString() : null;
        this.debouncedUpdatePreview();
    }

    addEmbedField(embedIndex) {
        this.data.embeds[embedIndex].fields.push({
            name: 'Поле',
            value: 'Значение',
            inline: false
        });
        this.renderEmbeds();
        this.updatePreview();
    }

    updateEmbedField(embedIndex, fieldIndex, property, value) {
        this.data.embeds[embedIndex].fields[fieldIndex][property] = value;
        this.debouncedUpdatePreview();
    }

    removeEmbedField(embedIndex, fieldIndex) {
        this.data.embeds[embedIndex].fields.splice(fieldIndex, 1);
        this.renderEmbeds();
        this.updatePreview();
    }

    removeEmbed(index) {
        this.data.embeds.splice(index, 1);
        this.renderEmbeds();
        this.updatePreview();
    }

    addButton() {
        if (!this.data.components.find(c => c.type === 1)) {
            this.data.components.push({
                type: 1,
                components: []
            });
        }

        const actionRow = this.data.components.find(c => c.type === 1);
        if (actionRow.components.length >= 5) {
            this.showNotification('Максимум 5 кнопок в ряду', 'error');
            return;
        }

        const button = {
            type: 2,
            style: 1,
            label: 'Кнопка',
            custom_id: `button_${Date.now()}`,
            disabled: false,
            action: {
                type: 'url',
                params: {}
            }
        };

        actionRow.components.push(button);
        this.renderComponents();
        this.updatePreview();
    }

    addSelect() {
        if (this.data.components.find(c => c.components && c.components.find(comp => comp.type === 3))) {
            this.showNotification('Можно добавить только один выпадающий список', 'error');
            return;
        }

        this.data.components.push({
            type: 1,
            components: [{
                type: 3,
                custom_id: `select_${Date.now()}`,
                placeholder: 'Выберите опцию...',
                min_values: 1,
                max_values: 1,
                options: [{
                    label: 'Опция 1',
                    value: 'option_1',
                    description: 'Описание опции',
                    action: {
                        type: 'role',
                        params: {}
                    }
                }]
            }]
        });

        this.renderComponents();
        this.updatePreview();
    }

    renderComponents() {
        const container = document.getElementById('componentsContainer');
        container.innerHTML = '';

        this.data.components.forEach((component, compIndex) => {
            if (component.type === 1) {
                component.components.forEach((item, itemIndex) => {
                    if (item.type === 2) {
                        this.renderButton(container, item, compIndex, itemIndex);
                    } else if (item.type === 3) {
                        this.renderSelect(container, item, compIndex, itemIndex);
                    }
                });
            }
        });
    }

    renderButton(container, button, compIndex, itemIndex) {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'component-item';
        buttonDiv.innerHTML = `
            <div class="component-header" onclick="app.toggleComponent('button-${compIndex}-${itemIndex}')">
                <span><i class="fas fa-hand-pointer"></i> Кнопка: ${button.label}</span>
                <div>
                    <button class="btn btn-small btn-secondary" onclick="app.editComponentAction(${compIndex}, ${itemIndex}); event.stopPropagation();">
                        <i class="fas fa-cog"></i> Действие
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.removeComponent(${compIndex}, ${itemIndex}); event.stopPropagation();">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="component-content" id="button-${compIndex}-${itemIndex}">
                <div class="field-group">
                    <label>Текст кнопки</label>
                    <input type="text" value="${button.label}" oninput="app.updateButton(${compIndex}, ${itemIndex}, 'label', this.value)" placeholder="Текст кнопки">
                </div>
                <div class="field-group">
                    <label>Стиль</label>
                    <select onchange="app.updateButton(${compIndex}, ${itemIndex}, 'style', parseInt(this.value))">
                        <option value="1" ${button.style === 1 ? 'selected' : ''}>Основной</option>
                        <option value="2" ${button.style === 2 ? 'selected' : ''}>Дополнительный</option>
                        <option value="3" ${button.style === 3 ? 'selected' : ''}>Успех</option>
                        <option value="4" ${button.style === 4 ? 'selected' : ''}>Опасность</option>
                        <option value="5" ${button.style === 5 ? 'selected' : ''}>Ссылка</option>
                    </select>
                </div>
                <div class="field-group">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" ${button.disabled ? 'checked' : ''} onchange="app.updateButton(${compIndex}, ${itemIndex}, 'disabled', this.checked)">
                        Отключена
                    </label>
                </div>
                ${button.style === 5 ? `
                    <div class="field-group">
                        <label>URL ссылки</label>
                        <input type="text" value="${button.url || ''}" oninput="app.updateButton(${compIndex}, ${itemIndex}, 'url', this.value)" placeholder="https://example.com">
                    </div>
                ` : ''}
            </div>
        `;
        container.appendChild(buttonDiv);
    }

    renderSelect(container, select, compIndex, itemIndex) {
        const selectDiv = document.createElement('div');
        selectDiv.className = 'component-item';
        selectDiv.innerHTML = `
            <div class="component-header" onclick="app.toggleComponent('select-${compIndex}-${itemIndex}')">
                <span><i class="fas fa-list"></i> Выпадающий список</span>
                <div>
                    <button class="btn btn-small btn-danger" onclick="app.removeComponent(${compIndex}, ${itemIndex}); event.stopPropagation();">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="component-content" id="select-${compIndex}-${itemIndex}">
                <div class="field-group">
                    <label>Плейсхолдер</label>
                    <input type="text" value="${select.placeholder}" oninput="app.updateSelect(${compIndex}, ${itemIndex}, 'placeholder', this.value)" placeholder="Выберите опцию...">
                </div>
                <div class="field-row">
                    <div class="field-group">
                        <label>Мин. значений</label>
                        <input type="number" min="0" max="25" value="${select.min_values}" onchange="app.updateSelect(${compIndex}, ${itemIndex}, 'min_values', parseInt(this.value))">
                    </div>
                    <div class="field-group">
                        <label>Макс. значений</label>
                        <input type="number" min="1" max="25" value="${select.max_values}" onchange="app.updateSelect(${compIndex}, ${itemIndex}, 'max_values', parseInt(this.value))">
                    </div>
                </div>
                <div class="field-group">
                    <label style="display: flex; justify-content: space-between; align-items: center;">
                        Опции
                        <button class="btn btn-small btn-secondary" onclick="app.addSelectOption(${compIndex}, ${itemIndex})">
                            <i class="fas fa-plus"></i> Добавить
                        </button>
                    </label>
                    <div id="select-options-${compIndex}-${itemIndex}">
                        ${this.renderSelectOptions(select.options, compIndex, itemIndex)}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(selectDiv);
    }

    renderSelectOptions(options, compIndex, itemIndex) {
        return options.map((option, optionIndex) => `
            <div class="embed-field-item" style="background: var(--background); padding: 1rem; margin-bottom: 0.5rem; border-radius: 6px; border: 1px solid var(--border);">
                <div class="field-row">
                    <div class="field-group" style="margin: 0;">
                        <label>Название</label>
                        <input type="text" value="${option.label}" oninput="app.updateSelectOption(${compIndex}, ${itemIndex}, ${optionIndex}, 'label', this.value)" placeholder="Название опции">
                    </div>
                    <div class="field-group" style="margin: 0;">
                        <label>Значение</label>
                        <input type="text" value="${option.value}" oninput="app.updateSelectOption(${compIndex}, ${itemIndex}, ${optionIndex}, 'value', this.value)" placeholder="option_value">
                    </div>
                </div>
                <div class="field-group" style="margin-top: 0.5rem;">
                    <label>Описание</label>
                    <input type="text" value="${option.description || ''}" oninput="app.updateSelectOption(${compIndex}, ${itemIndex}, ${optionIndex}, 'description', this.value)" placeholder="Описание опции">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <button class="btn btn-small btn-secondary" onclick="app.editSelectOptionAction(${compIndex}, ${itemIndex}, ${optionIndex})">
                        <i class="fas fa-cog"></i> Действие
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.removeSelectOption(${compIndex}, ${itemIndex}, ${optionIndex})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleComponent(id) {
        const content = document.getElementById(id);
        content.classList.toggle('collapsed');
    }

    updateButton(compIndex, itemIndex, property, value) {
        const button = this.data.components[compIndex].components[itemIndex];
        button[property] = value;

        if (property === 'style' && value !== 5 && button.url) {
            delete button.url;
            button.custom_id = `button_${Date.now()}`;
        } else if (property === 'style' && value === 5 && button.custom_id) {
            delete button.custom_id;
        }

        this.renderComponents();
        this.debouncedUpdatePreview();
    }

    updateSelect(compIndex, itemIndex, property, value) {
        this.data.components[compIndex].components[itemIndex][property] = value;
        this.debouncedUpdatePreview();
    }

    addSelectOption(compIndex, itemIndex) {
        const select = this.data.components[compIndex].components[itemIndex];
        if (select.options.length >= 25) {
            this.showNotification('Максимум 25 опций в списке', 'error');
            return;
        }

        select.options.push({
            label: `Опция ${select.options.length + 1}`,
            value: `option_${select.options.length + 1}`,
            description: '',
            action: {
                type: 'role',
                params: {}
            }
        });

        this.renderComponents();
        this.updatePreview();
    }

    updateSelectOption(compIndex, itemIndex, optionIndex, property, value) {
        this.data.components[compIndex].components[itemIndex].options[optionIndex][property] = value;
        this.debouncedUpdatePreview();
    }

    removeSelectOption(compIndex, itemIndex, optionIndex) {
        this.data.components[compIndex].components[itemIndex].options.splice(optionIndex, 1);
        this.renderComponents();
        this.updatePreview();
    }

    removeComponent(compIndex, itemIndex) {
        this.data.components[compIndex].components.splice(itemIndex, 1);
        if (this.data.components[compIndex].components.length === 0) {
            this.data.components.splice(compIndex, 1);
        }
        this.renderComponents();
        this.updatePreview();
    }

    editComponentAction(compIndex, itemIndex) {
        this.currentEditingComponent = { compIndex, itemIndex, type: 'button' };
        const button = this.data.components[compIndex].components[itemIndex];
        this.showActionModal(button.action || { type: 'url', params: {} });
    }

    editSelectOptionAction(compIndex, itemIndex, optionIndex) {
        this.currentEditingComponent = { compIndex, itemIndex, optionIndex, type: 'select' };
        const option = this.data.components[compIndex].components[itemIndex].options[optionIndex];
        this.showActionModal(option.action || { type: 'role', params: {} });
    }

    showActionModal(action) {
        const modal = document.getElementById('actionModal');
        const actionType = document.getElementById('actionType');
        
        actionType.value = action.type;
        this.updateActionParams(action.type, action.params);
        
        modal.classList.add('show');
    }

    hideActionModal() {
        document.getElementById('actionModal').classList.remove('show');
        this.currentEditingComponent = null;
    }

    updateActionParams(type, params = {}) {
        const container = document.getElementById('actionParams');
        let html = '';

        switch (type) {
            case 'url':
                html = `
                    <div class="field-group">
                        <label>URL ссылки</label>
                        <input type="text" id="actionUrl" value="${params.url || ''}" placeholder="https://example.com">
                    </div>
                `;
                break;
            case 'role':
                html = `
                    <div class="field-group">
                        <label>ID роли</label>
                        <input type="text" id="actionRoleId" value="${params.roleId || ''}" placeholder="123456789012345678">
                    </div>
                    <div class="field-group">
                        <label>Действие</label>
                        <select id="actionRoleAction">
                            <option value="add" ${params.action === 'add' ? 'selected' : ''}>Добавить роль</option>
                            <option value="remove" ${params.action === 'remove' ? 'selected' : ''}>Убрать роль</option>
                            <option value="toggle" ${params.action === 'toggle' ? 'selected' : ''}>Переключить роль</option>
                        </select>
                    </div>
                `;
                break;
            case 'channel':
                html = `
                    <div class="field-group">
                        <label>Название канала</label>
                        <input type="text" id="actionChannelName" value="${params.name || ''}" placeholder="новый-канал">
                    </div>
                    <div class="field-group">
                        <label>Тип канала</label>
                        <select id="actionChannelType">
                            <option value="text" ${params.type === 'text' ? 'selected' : ''}>Текстовый</option>
                            <option value="voice" ${params.type === 'voice' ? 'selected' : ''}>Голосовой</option>
                            <option value="category" ${params.type === 'category' ? 'selected' : ''}>Категория</option>
                        </select>
                    </div>
                `;
                break;
            case 'message':
                html = `
                    <div class="field-group">
                        <label>ID канала</label>
                        <input type="text" id="actionChannelId" value="${params.channelId || ''}" placeholder="123456789012345678">
                    </div>
                    <div class="field-group">
                        <label>Текст сообщения</label>
                        <textarea id="actionMessageContent" placeholder="Текст сообщения...">${params.content || ''}</textarea>
                    </div>
                `;
                break;
            case 'kick':
                html = `
                    <div class="field-group">
                        <label>Причина</label>
                        <input type="text" id="actionReason" value="${params.reason || ''}" placeholder="Причина кика">
                    </div>
                `;
                break;
            case 'ban':
                html = `
                    <div class="field-group">
                        <label>Причина</label>
                        <input type="text" id="actionReason" value="${params.reason || ''}" placeholder="Причина бана">
                    </div>
                    <div class="field-group">
                        <label>Удалить сообщения (дни)</label>
                        <input type="number" id="actionDeleteDays" min="0" max="7" value="${params.deleteMessageDays || 0}">
                    </div>
                `;
                break;
            case 'timeout':
                html = `
                    <div class="field-group">
                        <label>Длительность (минуты)</label>
                        <input type="number" id="actionDuration" min="1" max="40320" value="${params.duration || 60}">
                    </div>
                    <div class="field-group">
                        <label>Причина</label>
                        <input type="text" id="actionReason" value="${params.reason || ''}" placeholder="Причина таймаута">
                    </div>
                `;
                break;
            case 'custom':
                html = `
                    <div class="field-group">
                        <label>Кастомный ID</label>
                        <input type="text" id="actionCustomId" value="${params.customId || ''}" placeholder="custom_action_id">
                    </div>
                    <div class="field-group">
                        <label>Дополнительные данные (JSON)</label>
                        <textarea id="actionCustomData" placeholder='{"key": "value"}'>${JSON.stringify(params.data || {}, null, 2)}</textarea>
                    </div>
                `;
                break;
        }

        container.innerHTML = html;
    }

    saveAction() {
        if (!this.currentEditingComponent) return;

        const actionType = document.getElementById('actionType').value;
        const action = { type: actionType, params: {} };

        switch (actionType) {
            case 'url':
                action.params.url = document.getElementById('actionUrl').value;
                break;
            case 'role':
                action.params.roleId = document.getElementById('actionRoleId').value;
                action.params.action = document.getElementById('actionRoleAction').value;
                break;
            case 'channel':
                action.params.name = document.getElementById('actionChannelName').value;
                action.params.type = document.getElementById('actionChannelType').value;
                break;
            case 'message':
                action.params.channelId = document.getElementById('actionChannelId').value;
                action.params.content = document.getElementById('actionMessageContent').value;
                break;
            case 'kick':
            case 'timeout':
                action.params.reason = document.getElementById('actionReason').value;
                if (actionType === 'timeout') {
                    action.params.duration = parseInt(document.getElementById('actionDuration').value);
                }
                break;
            case 'ban':
                action.params.reason = document.getElementById('actionReason').value;
                action.params.deleteMessageDays = parseInt(document.getElementById('actionDeleteDays').value);
                break;
            case 'custom':
                action.params.customId = document.getElementById('actionCustomId').value;
                try {
                    action.params.data = JSON.parse(document.getElementById('actionCustomData').value);
                } catch (e) {
                    action.params.data = {};
                }
                break;
        }

        const { compIndex, itemIndex, optionIndex, type } = this.currentEditingComponent;

        if (type === 'button') {
            this.data.components[compIndex].components[itemIndex].action = action;
        } else if (type === 'select') {
            this.data.components[compIndex].components[itemIndex].options[optionIndex].action = action;
        }

        this.hideActionModal();
        this.renderComponents();
    }

    updatePreview() {
        // Проверяем, изменились ли данные для предотвращения лишних обновлений
        const currentDataString = JSON.stringify(this.data);
        if (this.lastPreviewData === currentDataString) {
            return;
        }
        this.lastPreviewData = currentDataString;

        const preview = document.getElementById('messagePreview');
        let html = '';

        const username = this.data.username || 'WhookBuilder';
        const avatarUrl = this.data.avatar_url;
        const content = this.data.content;

        html += `
            <div class="message-header">
                <div class="message-avatar">
                    ${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar" onerror="this.style.display='none'; this.parentElement.textContent='${username[0].toUpperCase()}'">` : username[0].toUpperCase()}
                </div>
                <div class="message-username">${username}</div>
            </div>
        `;

        if (content) {
            html += `<div class="message-content">${this.formatDiscordContent(content)}</div>`;
        }

        this.data.embeds.forEach(embed => {
            html += this.renderEmbedPreview(embed);
        });

        if (this.data.components.length > 0) {
            html += '<div class="components-preview">';
            html += this.renderComponentsPreview();
            html += '</div>';
        }

        preview.innerHTML = html;
    }

    // Дебаунсинг обновления предпросмотра для производительности
    debouncedUpdatePreview() {
        if (this.previewUpdateTimeout) {
            clearTimeout(this.previewUpdateTimeout);
        }
        
        this.previewUpdateTimeout = setTimeout(() => {
            this.updatePreview();
        }, 100); // 100мс задержка для оптимизации производительности
    }

    formatDiscordContent(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<u>$1</u>')
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            .replace(/`(.*?)`/g, '<code style="background: var(--surface); padding: 0.2em 0.4em; border-radius: 3px;">$1</code>')
            .replace(/\n/g, '<br>');
    }

    renderEmbedPreview(embed) {
        let html = '<div class="embed-preview"';
        if (embed.color) {
            html += ` style="border-left-color: #${embed.color.toString(16).padStart(6, '0')}"`;
        }
        html += '>';

        if (embed.author && embed.author.name) {
            html += '<div class="embed-author" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; font-size: 0.85rem;">';
            if (embed.author.icon_url) {
                html += `<img src="${embed.author.icon_url}" alt="" style="width: 20px; height: 20px; border-radius: 50%;">`;
            }
            if (embed.author.url) {
                html += `<a href="${embed.author.url}" style="color: var(--text-primary); text-decoration: none;">${embed.author.name}</a>`;
            } else {
                html += `<span style="color: var(--text-primary);">${embed.author.name}</span>`;
            }
            html += '</div>';
        }

        if (embed.title) {
            html += `<div class="embed-title">${embed.title}</div>`;
        }

        if (embed.description) {
            html += `<div class="embed-description">${this.formatDiscordContent(embed.description)}</div>`;
        }

        if (embed.thumbnail && embed.thumbnail.url) {
            html += `<img src="${embed.thumbnail.url}" alt="" class="embed-thumbnail">`;
        }

        if (embed.fields && embed.fields.length > 0) {
            html += '<div class="embed-fields">';
            embed.fields.forEach(field => {
                html += `<div class="embed-field${field.inline ? ' inline' : ''}">`;
                html += `<div class="field-name">${field.name}</div>`;
                html += `<div class="field-value">${this.formatDiscordContent(field.value)}</div>`;
                html += '</div>';
            });
            html += '</div>';
        }

        if (embed.image && embed.image.url) {
            html += `<img src="${embed.image.url}" alt="" class="embed-image">`;
        }

        if ((embed.footer && embed.footer.text) || embed.timestamp) {
            html += '<div class="embed-footer">';
            if (embed.footer && embed.footer.icon_url) {
                html += `<img src="${embed.footer.icon_url}" alt="" style="width: 16px; height: 16px; border-radius: 50%;">`;
            }
            if (embed.footer && embed.footer.text) {
                html += `<span>${embed.footer.text}</span>`;
            }
            if (embed.timestamp) {
                if (embed.footer && embed.footer.text) html += ' • ';
                html += `<span>${new Date(embed.timestamp).toLocaleString()}</span>`;
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    renderComponentsPreview() {
        let html = '';

        this.data.components.forEach(component => {
            if (component.type === 1) {
                const buttons = component.components.filter(c => c.type === 2);
                const selects = component.components.filter(c => c.type === 3);

                if (buttons.length > 0) {
                    html += '<div class="button-row">';
                    buttons.forEach(button => {
                        let className = 'discord-button ';
                        switch (button.style) {
                            case 1: className += 'primary'; break;
                            case 2: className += 'secondary'; break;
                            case 3: className += 'success'; break;
                            case 4: className += 'danger'; break;
                            case 5: className += 'link'; break;
                        }
                        
                        html += `<button class="${className}" ${button.disabled ? 'disabled' : ''}>${button.label}</button>`;
                    });
                    html += '</div>';
                }

                selects.forEach(select => {
                    html += `<div class="discord-select">${select.placeholder}</div>`;
                });
            }
        });

        return html;
    }

    showImportModal() {
        document.getElementById('importModal').classList.add('show');
        document.getElementById('importTextarea').value = '';
    }

    hideImportModal() {
        document.getElementById('importModal').classList.remove('show');
    }

    importJson() {
        try {
            const jsonText = document.getElementById('importTextarea').value;
            const importedData = JSON.parse(jsonText);

            if (importedData.embeds || importedData.content !== undefined || importedData.components) {
                this.data = {
                    content: importedData.content || '',
                    username: importedData.username || '',
                    avatar_url: importedData.avatar_url || '',
                    embeds: importedData.embeds || [],
                    components: importedData.components || []
                };

                document.getElementById('messageContent').value = this.data.content;
                document.getElementById('username').value = this.data.username;
                document.getElementById('avatarUrl').value = this.data.avatar_url;

                this.renderEmbeds();
                this.renderComponents();
                this.updatePreview();

                this.hideImportModal();
                this.showNotification('JSON успешно импортирован!', 'success');
            } else {
                throw new Error('Неверный формат данных');
            }
        } catch (error) {
            this.showNotification('Ошибка при импорте JSON: ' + error.message, 'error');
        }
    }

    exportJson() {
        const cleanData = JSON.parse(JSON.stringify(this.data));
        
        cleanData.components = cleanData.components.filter(component => {
            if (component.type === 1 && component.components) {
                component.components = component.components.filter(item => {
                    if (item.type === 3) {
                        return item.options && item.options.length > 0 && item.options.length <= 25;
                    }
                    return true;
                });
                return component.components.length > 0;
            }
            return false;
        });
        
        cleanData.embeds = cleanData.embeds.map(embed => {
            const cleanEmbed = {};
            
            if (embed.title) cleanEmbed.title = embed.title;
            if (embed.description) cleanEmbed.description = embed.description;
            if (embed.color) cleanEmbed.color = embed.color;
            if (embed.thumbnail && embed.thumbnail.url) cleanEmbed.thumbnail = { url: embed.thumbnail.url };
            if (embed.image && embed.image.url) cleanEmbed.image = { url: embed.image.url };
            if (embed.author && embed.author.name) {
                cleanEmbed.author = { name: embed.author.name };
                if (embed.author.icon_url) cleanEmbed.author.icon_url = embed.author.icon_url;
                if (embed.author.url) cleanEmbed.author.url = embed.author.url;
            }
            if (embed.footer && embed.footer.text) {
                cleanEmbed.footer = { text: embed.footer.text };
                if (embed.footer.icon_url) cleanEmbed.footer.icon_url = embed.footer.icon_url;
            }
            if (embed.timestamp) cleanEmbed.timestamp = embed.timestamp;
            if (embed.fields && embed.fields.length > 0) {
                cleanEmbed.fields = embed.fields.filter(field => field.name && field.value);
            }
            
            return cleanEmbed;
        }).filter(embed => Object.keys(embed).length > 0);

        if (!cleanData.content) delete cleanData.content;
        if (!cleanData.username) delete cleanData.username;
        if (!cleanData.avatar_url) delete cleanData.avatar_url;
        if (cleanData.embeds.length === 0) delete cleanData.embeds;
        if (cleanData.components.length === 0) delete cleanData.components;

        const jsonString = JSON.stringify(cleanData, null, 2);
        
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'webhook-message.json';
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('JSON экспортирован!', 'success');
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('importTextarea').value = e.target.result;
            this.showImportModal();
        };
        reader.readAsText(file);
    }

    clearAll() {
        if (confirm('Вы уверены, что хотите очистить все данные?')) {
            this.data = {
                content: '',
                username: '',
                avatar_url: '',
                embeds: [],
                components: []
            };

            document.getElementById('messageContent').value = '';
            document.getElementById('username').value = '';
            document.getElementById('avatarUrl').value = '';

            this.renderEmbeds();
            this.renderComponents();
            this.updatePreview();

            this.showNotification('Все данные очищены', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: var(--shadow-large);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

const app = new WhookBuilder();

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
