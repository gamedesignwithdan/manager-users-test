import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from './services/user.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private usersSubscription: Subscription | null = null;

  // Data & Filter State
  readonly users = signal<User[]>([]);
  readonly loading = signal<boolean>(true);
  readonly searchTerm = signal<string>('');
  readonly roleFilter = signal<string>('all');
  readonly roles = ['Admin', 'Manager', 'Editor', 'Viewer'] as const;

  // Add / Edit Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly editingUser = signal<User | null>(null);
  readonly formUsername = signal<string>('');
  readonly formRole = signal<string>('Viewer');
  readonly formStatus = signal<'active' | 'disabled'>('active');
  readonly isSaving = signal<boolean>(false);
  readonly formError = signal<string>('');

  // Delete Confirmation State
  readonly userToDelete = signal<User | null>(null);
  readonly isDeleting = signal<boolean>(false);

  // Status Notification
  readonly notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Instant Filtered Computation
  readonly filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.roleFilter();

    return this.users().filter((user) => {
      const matchSearch =
        !term ||
        user.username.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term);

      const matchRole = role === 'all' || user.role === role;

      return matchSearch && matchRole;
    });
  });

  ngOnInit(): void {
    this.usersSubscription = this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Firestore subscription error:', err);
        this.notify('Failed to load users from Firestore.', 'error');
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.usersSubscription?.unsubscribe();
  }

  // Add / Edit Handlers
  openAddModal(): void {
    this.editingUser.set(null);
    this.formUsername.set('');
    this.formRole.set('Viewer');
    this.formStatus.set('active');
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.formUsername.set(user.username);
    this.formRole.set(user.role);
    this.formStatus.set(user.status);
    this.formError.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
    this.formError.set('');
  }

  async saveUser(): Promise<void> {
    const name = this.formUsername().trim();
    if (!name) {
      this.formError.set('Username is required.');
      return;
    }
    if (name.length < 2 || name.length > 30) {
      this.formError.set('Username must be between 2 and 30 characters.');
      return;
    }

    this.isSaving.set(true);
    this.formError.set('');

    try {
      const editing = this.editingUser();
      if (editing) {
        await this.userService.updateUser(editing.id, {
          username: name,
          role: this.formRole(),
          status: this.formStatus()
        });
        this.notify(`User "${name}" updated successfully.`, 'success');
      } else {
        await this.userService.addUser(name, this.formRole());
        this.notify(`User "${name}" created successfully.`, 'success');
      }
      this.closeModal();
    } catch (err: any) {
      console.error('Save user error:', err);
      this.formError.set(err.message || 'Failed to save user.');
    } finally {
      this.isSaving.set(false);
    }
  }

  // Toggle Status
  async toggleStatus(user: User): Promise<void> {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await this.userService.updateUser(user.id, { status: nextStatus });
      this.notify(`User "${user.username}" is now ${nextStatus}.`, 'success');
    } catch (err) {
      console.error('Toggle status error:', err);
      this.notify(`Failed to update status for ${user.username}.`, 'error');
    }
  }

  // Delete via Cloud Function
  openDeleteModal(user: User): void {
    this.userToDelete.set(user);
  }

  cancelDelete(): void {
    this.userToDelete.set(null);
  }

  async executeDelete(): Promise<void> {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    try {
      await this.userService.deleteUser(user.id);
      this.notify(`User "${user.username}" deleted via Cloud Function.`, 'success');
      this.cancelDelete();
    } catch (err: any) {
      console.error('Delete error:', err);
      this.notify('Failed to delete user via Cloud Function.', 'error');
    } finally {
      this.isDeleting.set(false);
    }
  }

  private notify(message: string, type: 'success' | 'error'): void {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3500);
  }
}
