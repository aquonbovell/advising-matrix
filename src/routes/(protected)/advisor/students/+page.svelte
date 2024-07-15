<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	function getInviteLink(inviteToken: string | null) {
		if (inviteToken === null) return '';
		return `${window.location.origin}/register?token=${inviteToken}`;
	}
</script>

<h1>My Students</h1>
<a href="/advisor/students/invite">Invite Student</a>

{#if data.students.length === 0}
	<p>You don't have any students assigned yet.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>Email</th>
				<th>Joined</th>
				<th>Last Updated</th>
				<th>Status</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			{#each data.students as student}
				<tr>
					<td>{student.email}</td>
					<td>{new Date(student.created_at).toLocaleDateString()}</td>
					<td>{new Date(student.updated_at).toLocaleDateString()}</td>
					<td>
						{#if student.invite_token}
							{#if student.invite_expires && new Date(student.invite_expires) > new Date()}
								Invited (expires {new Date(student.invite_expires).toLocaleDateString()})
							{:else if !student.invite_expires}
								Invitation expired
							{:else}
								Invitation expired
							{/if}
						{:else}
							Active
						{/if}
					</td>
					<td>
						{#if student.invite_token}
							<button
								on:click={() => navigator.clipboard.writeText(getInviteLink(student.invite_token))}
							>
								Copy Invite Link
							</button>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
</style>
