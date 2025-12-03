import { test, expect } from '@playwright/test';

test.describe('Optimistic Updates', () => {
    test('should optimistically add and remove task from filtered list', async ({ page }) => {
        // Mock API to simulate delay
        await page.route('**/api/tasks', async route => {
            const request = route.request();
            if (request.method() === 'POST') {
                // Delay response to verify optimistic update
                await new Promise(resolve => setTimeout(resolve, 2000));
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        task: {
                            _id: 'new-task-id',
                            title: 'Optimistic Task',
                            status: 'todo',
                            createdAt: new Date().toISOString()
                        }
                    })
                });
            } else {
                await route.continue();
            }
        });

        await page.route('**/api/tasks/*', async route => {
            if (route.request().method() === 'DELETE') {
                // Delay response
                await new Promise(resolve => setTimeout(resolve, 2000));
                await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
            } else {
                await route.continue();
            }
        });

        // 1. Navigate to tasks page
        await page.goto('/dashboard/tasks/list');

        // 2. Apply filter (e.g., Todo)
        // Assuming there's a filter button or tab for 'Todo'
        // Adjust selector based on actual UI
        const todoFilter = page.getByText('Todo', { exact: true });
        if (await todoFilter.isVisible()) {
            await todoFilter.click();
        }

        // 3. Create Task
        await page.getByRole('button', { name: /create task|new task/i }).click();
        await page.getByLabel(/title/i).fill('Optimistic Task');
        await page.getByRole('button', { name: /create|save/i }).click();

        // 4. Verify Immediate Appearance (Optimistic)
        // The task should appear BEFORE the 2s API delay finishes
        const taskItem = page.getByText('Optimistic Task');
        await expect(taskItem).toBeVisible({ timeout: 500 }); // Should be visible almost instantly

        // Wait for API to actually finish (optional, but good for stability)
        await page.waitForTimeout(2500);

        // 5. Delete Task
        // Find delete button for the task
        // This selector might need adjustment based on actual UI structure
        await taskItem.click();
        await page.getByRole('button', { name: /delete/i }).click();
        await page.getByRole('button', { name: /confirm/i }).click();

        // 6. Verify Immediate Disappearance (Optimistic)
        await expect(taskItem).toBeHidden({ timeout: 500 });
    });
});
