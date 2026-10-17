<script lang="ts">
	let {
		open = $bindable(false),
		title,
		message,
		confirmLabel,
		cancelLabel,
		onconfirm
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmLabel: string;
		cancelLabel: string;
		onconfirm: () => void;
	} = $props();

	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	function confirm(): void {
		open = false;
		onconfirm();
	}
</script>

<dialog
	bind:this={dialog}
	class="noprint"
	aria-labelledby="confirm-title"
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
>
	<h2 id="confirm-title">{title}</h2>
	<p class="muted">{message}</p>
	<div class="actions">
		<button type="button" onclick={() => (open = false)}>{cancelLabel}</button>
		<button type="button" class="primary" onclick={confirm}
			>{confirmLabel}</button
		>
	</div>
</dialog>

<style>
	dialog {
		margin: auto;
		width: min(400px, calc(100vw - 32px));
		padding: 22px;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--line2);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(3px);
	}
	h2 {
		margin: 0 0 8px;
		font-size: 18px;
	}
	p {
		margin: 0;
		font-size: 14px;
		line-height: 1.55;
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}
</style>
