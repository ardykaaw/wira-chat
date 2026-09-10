<?php

namespace App\Http\Controllers\Wira;

use App\Models\WiraWhatsappGroup;
use Illuminate\Http\Request;

class WiraWhatsappGroupController
{
    public function index()
    {
        return inertia('wira/WhatsappGroups', [
            'groups' => WiraWhatsappGroup::orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'group_id' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        WiraWhatsappGroup::create($request->all());

        return redirect()->back()->with('success', 'Grup WhatsApp berhasil ditambahkan');
    }

    public function update(Request $request, string $id)
    {
        $group = WiraWhatsappGroup::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'group_id' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $group->update($request->all());

        return redirect()->back()->with('success', 'Grup WhatsApp berhasil diperbarui');
    }

    public function destroy(string $id)
    {
        $group = WiraWhatsappGroup::findOrFail($id);
        $group->delete();

        return redirect()->back()->with('success', 'Grup WhatsApp berhasil dihapus');
    }
}