import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings as SettingsIcon, Loader2, CheckCircle2, Moon, Sun, Bell, Sparkles } from 'lucide-react';
import { createDemoNotifications, clearAllNotifications } from '../utils/notificationDemo';

export function SettingsView() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({
    full_name: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [creatingDemo, setCreatingDemo] = useState(false);
  const [clearingNotifs, setClearingNotifs] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: data.email,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDemoNotifications = async () => {
    setCreatingDemo(true);
    try {
      await createDemoNotifications(user!.id);
      alert('Demo notifications created! Check the bell icon in the workspace.');
    } catch (error) {
      console.error('Error creating demo notifications:', error);
      alert('Failed to create demo notifications');
    } finally {
      setCreatingDemo(false);
    }
  };

  const handleClearNotifications = async () => {
    setClearingNotifs(true);
    try {
      await clearAllNotifications(user!.id);
      alert('All notifications cleared!');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      alert('Failed to clear notifications');
    } finally {
      setClearingNotifs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="dark:text-gray-200">Dark Mode</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Switch between light and dark theme
              </p>
            </div>
            <div
              onClick={toggleTheme}
              className="relative w-20 h-10 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer transition-colors duration-500"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-9 h-9 rounded-full shadow-md transform transition-all duration-500 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'translate-x-[2.5rem] bg-gray-800'
                    : 'translate-x-0 bg-secondary-400'
                }`}
              >
                <span className={`text-xl ${theme === 'dark' ? 'text-secondary-400' : 'text-gray-800'}`}>
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <SettingsIcon className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="full_name" className="dark:text-gray-200">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Enter your full name"
                className="mt-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="email" className="dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="mt-2 bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            <Button type="submit" disabled={saving || saved} className="w-full">
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Bell className="w-5 h-5" />
            Notifications Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create sample notifications to see how task reminders and performance insights work.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateDemoNotifications}
                disabled={creatingDemo}
                className="flex-1"
              >
                {creatingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Demo Notifications
                  </>
                )}
              </Button>
              <Button
                onClick={handleClearNotifications}
                disabled={clearingNotifs}
                variant="outline"
                className="flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                {clearingNotifs ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear All Notifications'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Account ID</span>
              <span className="font-mono text-xs text-gray-900 dark:text-gray-200">{user?.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Created</span>
              <span className="text-gray-900 dark:text-gray-200">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                Active
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
