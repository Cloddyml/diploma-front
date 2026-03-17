<template>
    <div class="editor-wrapper" :class="{ focused }">
        <div class="editor-toolbar">
            <span class="editor-lang">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    style="
                        display: inline;
                        vertical-align: middle;
                        margin-right: 5px;
                    "
                >
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                        fill="#3572A5"
                        opacity=".9"
                    />
                    <path
                        d="M8.5 7h3C13.43 7 15 8.57 15 10.5S13.43 14 11.5 14H10v3H8.5V7zm1.5 5.5h1.5c.83 0 1.5-.67 1.5-1.5S12.33 8.5 11.5 8.5H10V12.5z"
                        fill="#fff"
                    />
                </svg>
                Python 3
            </span>
            <button
                class="btn-reset"
                @click="$emit('reset')"
                title="Сбросить к стартовому коду"
            >
                ↺ Сбросить
            </button>
        </div>
        <div ref="container" class="cm-host" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

const props = defineProps({
    modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "reset"]);

const container = ref(null);
const focused = ref(false);
let view = null;

// -- Тема редактора -------------------------------
const editorTheme = EditorView.theme(
    {
        "&": {
            background: "var(--surface)",
            color: "var(--text)",
            fontFamily: "var(--font)",
            fontSize: "14px",
        },
        ".cm-scroller": {
            fontFamily: "inherit",
        },
        ".cm-content": {
            padding: "14px 0",
            caretColor: "var(--accent)",
            minHeight: "320px",
        },
        ".cm-line": {
            padding: "0 16px 0 8px",
            lineHeight: "1.65",
        },
        ".cm-gutters": {
            background: "color-mix(in srgb, var(--bg) 60%, var(--surface))",
            borderRight: "1px solid var(--border)",
            color: "var(--text-muted)",
            minWidth: "44px",
            paddingRight: "4px",
        },
        ".cm-lineNumbers .cm-gutterElement": {
            padding: "0 8px",
        },
        ".cm-activeLine": {
            background: "rgba(99,102,241,0.06)",
        },
        ".cm-activeLineGutter": {
            background: "rgba(99,102,241,0.1)",
            color: "#818cf8",
        },
        ".cm-cursor": {
            borderLeftColor: "var(--accent)",
            borderLeftWidth: "2px",
        },
        ".cm-selectionBackground, ::selection": {
            background: "rgba(99,102,241,0.28) !important",
        },
        ".cm-focused .cm-selectionBackground": {
            background: "rgba(99,102,241,0.32) !important",
        },
        ".cm-matchingBracket": {
            background: "rgba(99,102,241,0.25)",
            outline: "1px solid var(--accent)",
            borderRadius: "2px",
        },
    },
    { dark: true },
);

// -- Подсветка синтаксиса Python -------------------------------
const pythonHighlight = HighlightStyle.define([
    // Ключевые слова: if, for, def, class, return, import...
    { tag: tags.keyword, color: "#c792ea" },
    // Встроенные: print, len, range, True, False, None...
    { tag: tags.standard(tags.name), color: "#82aaff" },
    { tag: tags.bool, color: "#ff5370" },
    { tag: tags.null, color: "#ff5370" },
    // Числа
    { tag: tags.number, color: "#f78c6c" },
    // Строки
    { tag: tags.string, color: "#c3e88d" },
    { tag: tags.special(tags.string), color: "#80cbc4" },
    // Комментарии
    { tag: tags.comment, color: "#546e7a", fontStyle: "italic" },
    // Операторы
    { tag: tags.operator, color: "#89ddff" },
    { tag: tags.punctuation, color: "#89ddff" },
    // Имена функций и классов
    { tag: tags.function(tags.variableName), color: "#82aaff" },
    { tag: tags.function(tags.name), color: "#82aaff" },
    { tag: tags.definition(tags.variableName), color: "#f07178" },
    { tag: tags.className, color: "#ffcb6b" },
    { tag: tags.typeName, color: "#ffcb6b" },
    // Декораторы
    { tag: tags.meta, color: "#f07178" },
    // Аргументы
    { tag: tags.propertyName, color: "#f07178" },
    { tag: tags.self, color: "#ff5370", fontStyle: "italic" },
]);

// -- Базовые горячие клавиши (Tab, Shift+Tab) -------------------------------
const tabKeymap = keymap.of([
    {
        key: "Tab",
        run(v) {
            v.dispatch(v.state.replaceSelection("    "));
            return true;
        },
    },
    {
        key: "Shift-Tab",
        run(v) {
            const { state } = v;
            const changes = [];
            const ranges = state.selection.ranges;
            for (const range of ranges) {
                const startLine = state.doc.lineAt(range.from);
                const endLine = state.doc.lineAt(range.to);
                for (let ln = startLine.number; ln <= endLine.number; ln++) {
                    const line = state.doc.line(ln);
                    const match = line.text.match(/^( {1,4}|\t)/);
                    if (match) {
                        changes.push({
                            from: line.from,
                            to: line.from + match[0].length,
                            insert: "",
                        });
                    }
                }
            }
            if (changes.length) v.dispatch({ changes });
            return true;
        },
    },
]);

// -- Авто-отступ при Enter -------------------------------
const autoIndent = EditorView.domEventHandlers({
    keydown(e, view) {
        if (e.key !== "Enter") return false;
        const { state } = view;
        const range = state.selection.main;
        const line = state.doc.lineAt(range.from);
        const indent = line.text.match(/^(\s*)/)[1];
        const extra = line.text.trimEnd().endsWith(":") ? "    " : "";
        const insert = "\n" + indent + extra;
        view.dispatch({
            changes: { from: range.from, to: range.to, insert },
            selection: { anchor: range.from + insert.length },
        });
        e.preventDefault();
        return true;
    },
});

// -- Слушатель фокуса -------------------------------
const focusExt = [
    EditorView.domEventHandlers({
        focus() {
            focused.value = true;
            return false;
        },
        blur() {
            focused.value = false;
            return false;
        },
    }),
];

onMounted(() => {
    const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            emit("update:modelValue", update.state.doc.toString());
        }
    });

    view = new EditorView({
        state: EditorState.create({
            doc: props.modelValue,
            extensions: [
                lineNumbers(),
                highlightActiveLine(),
                python(),
                syntaxHighlighting(pythonHighlight),
                editorTheme,
                tabKeymap,
                autoIndent,
                focusExt,
                updateListener,
            ],
        }),
        parent: container.value,
    });
});

onBeforeUnmount(() => {
    view?.destroy();
});

// Sync внешних изменений (например, сброс к стартовому коду)
watch(
    () => props.modelValue,
    (val) => {
        if (!view) return;
        const current = view.state.doc.toString();
        if (val !== current) {
            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: val ?? "",
                },
            });
        }
    },
);
</script>

<style scoped>
.editor-wrapper {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 12px;
    transition: border-color 0.15s;
}
.editor-wrapper.focused {
    border-color: var(--accent);
}

.editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: color-mix(in srgb, var(--bg) 60%, var(--surface));
    border-bottom: 1px solid var(--border);
    user-select: none;
}
.editor-lang {
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}
.btn-reset {
    background: transparent;
    color: var(--text-muted);
    border: 1px solid var(--border);
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 4px;
    line-height: 1.4;
}
.btn-reset:hover {
    color: var(--text);
    border-color: var(--accent);
    background: transparent;
}

.cm-host {
    overflow: auto;
    max-height: 520px;
}

/* Убираем outline у самого CodeMirror — граница управляется .editor-wrapper */
.cm-host :deep(.cm-editor) {
    outline: none !important;
}
.cm-host :deep(.cm-editor.cm-focused) {
    outline: none !important;
}
</style>
