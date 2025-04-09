
  {/* New Budget Dialog */}
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogDescription>
          Set up a budget to track and manage your cloud spending.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            className="col-span-3"
            value={newBudget.name}
            onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount ($)
          </Label>
          <Input
            id="amount"
            type="number"
            className="col-span-3"
            value={newBudget.amount}
            onChange={(e) => setNewBudget({...newBudget, amount: parseFloat(e.target.value)})}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="period" className="text-right">
            Period
          </Label>
          <Select 
            value={newBudget.period} 
            onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setNewBudget({...newBudget, period: value})}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startDate" className="text-right">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            className="col-span-3"
            value={newBudget.startDate}
            onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleCreateBudget}>
          Create Budget
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
