import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test-deploy')({
    component: TestDeployPage,
})

function TestDeployPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Deployment Test
                </h1>
                <p className="text-gray-600">
                    If you see this page, auto-deployment is working!
                </p>
                <p className="text-sm text-gray-400 mt-4">
                    Build time: December 19, 2025
                </p>
            </div>
        </div>
    )
}
